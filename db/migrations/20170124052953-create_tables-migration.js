module.exports = {
  up: (queryInterface, Sequelize) => {
    const { STRING, INTEGER, DATE } = Sequelize
    return queryInterface.createTable('users', {
      id: { type: INTEGER, primaryKey: true, autoIncrement: true, scopes: ['public'] },
      username: STRING,
      created_at: DATE,
      updated_at: DATE,
    }).then(() => {
      queryInterface.createTable('todos', {
        id: { type: INTEGER, primaryKey: true, autoIncrement: true, scopes: ['public'] },
        title: STRING,
        user_id: {
          type: INTEGER,
          references: {
            model: 'users',
            key: 'id',
          },
          onUpdate: 'cascade',
          onDelete: 'cascade',
        },
        created_at: DATE,
        updated_at: DATE,
      })
    })
  },
  down: queryInterface => (
    queryInterface.dropTable('todos').then(() => (
      queryInterface.dropTable('users')
    ))
  ),
}
