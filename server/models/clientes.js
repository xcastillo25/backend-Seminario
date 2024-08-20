module.exports = (sequelize, DataTypes) => {
    const Clientes = sequelize.define(
        'Clientes',{
            idcliente: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            nombre: {
                type: DataTypes.STRING(100),
                allowNull: false
            },
            apellidos: {
                type: DataTypes.STRING(100),
                allowNull: false
            },
            cui: {
                type: DataTypes.STRING(13),
                allowNull: false
            },
            telefono: {
                type: DataTypes.STRING(8),
                allowNull: false
            },
            email: {
                type: DataTypes.STRING(50),
                allowNull: false
            },
            activo: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true
            }
        },
        {
            timestamps: false,
            tableName: 'tblclientes'
        }
    );

    return Clientes;
};