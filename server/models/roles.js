module.exports = (sequelize, DataTypes) => {
    const Roles = sequelize.define(
        'Roles',{
            idrol: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            rol: {
                type: DataTypes.STRING(50),
                allowNull: false
            },
            activo: {
                type: DataTypes.BOOLEAN,
                allowNull: true
            }
        },
        {
            timestamps: false,
            tableName: 'tblroles'
        }
    );

    return Roles;
};