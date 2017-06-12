export function NotImplementException() {

}

// https://github.com/postgres/postgres/blob/2d460179baa8744e9e2a183a5121306596c53fba/src/bin/psql/command.c
const describe = ({ subCommand, showVerbose }) => {
  let relKind = ''
  let verbose = ''
  if (subCommand === '') {
    relKind = "('r','v','m','S','f','')"
  } else if (subCommand === 't') {
    relKind = "('r', '')"
  } else {
    throw new NotImplementException()
  }

  if (showVerbose) {
    verbose = `, pg_catalog.pg_size_pretty(pg_catalog.pg_table_size(c.oid)) as "Size",
pg_catalog.obj_description(c.oid, 'pg_class') as "Description"`
  }

  return `SELECT n.nspname as "Schema",
      c.relname as "Name",
      CASE c.relkind WHEN 'r' THEN 'table' WHEN 'v' THEN 'view' WHEN 'm' THEN 'materialized view' WHEN 'i' THEN 'index' WHEN 'S' THEN 'sequence' WHEN 's' THEN 'special' WHEN 'f' THEN 'foreign table' END as "Type",
      pg_catalog.pg_get_userbyid(c.relowner) as "Owner"
      ${verbose}
    FROM pg_catalog.pg_class c
        LEFT JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relkind IN ${relKind}
          AND n.nspname <> 'pg_catalog'
          AND n.nspname <> 'information_schema'
          AND n.nspname !~ '^pg_toast'
      AND pg_catalog.pg_table_is_visible(c.oid)
    ORDER BY 1,2;`
}

const databases = ({ showVerbose }) => {
  let verboseField = ''
  let verboseJoin = ''
  if (showVerbose) {
    verboseField = `, CASE WHEN pg_catalog.has_database_privilege(d.datname, 'CONNECT')
            THEN pg_catalog.pg_size_pretty(pg_catalog.pg_database_size(d.datname))
            ELSE 'No Access'
       END as "Size",
       t.spcname as "Tablespace",
       pg_catalog.shobj_description(d.oid, 'pg_database') as "Description"`
    verboseJoin = ' JOIN pg_catalog.pg_tablespace t on d.dattablespace = t.oid'
  }
  return `SELECT d.datname as "Name",
       pg_catalog.pg_get_userbyid(d.datdba) as "Owner",
       pg_catalog.pg_encoding_to_char(d.encoding) as "Encoding",
       d.datcollate as "Collate",
       d.datctype as "Ctype",
       pg_catalog.array_to_string(d.datacl, E'\n') AS "Access privileges"
       ${verboseField}
FROM pg_catalog.pg_database d
${verboseJoin}
ORDER BY 1;`
}

export const getSlashCommandQuery = (query) => {
  const match = query.trim().match(/\\([a-z]){1}([^S+\s]{0,2})(S?)(\+?)((\s.*)?)/)
  const args = {
    command: match[1],
    subCommand: match[2],
    showVerbose: match[4] !== '',
    showSystem: match[3] !== '',
    patterns: match[5].trim(),
  }

  switch (query[1]) {
    case 'd':
      return describe(args)
    case 'l':
      return databases(args)
    default:
      throw new NotImplementException()
  }
}
