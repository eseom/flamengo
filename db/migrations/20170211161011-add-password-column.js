module.exports = {
  up: (queryInterface, Sequelize) => {
    const { STRING } = Sequelize
    return queryInterface.addColumn('users', 'password', {
      type: STRING,
    })
  },
  down: queryInterface => (
    queryInterface.removeColumn('users', 'password')
  ),
}
