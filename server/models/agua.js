module.exports = (sequelize, DataTypes) => {
    const Agua = sequelize.define(
        'Agua',{
            idagua: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            servicio: {
                type: DataTypes.STRING(50),
                allowNull: false
            },
            cuota: {
                type: DataTypes.DECIMAL(18,2),
                allowNull: true
            },
            mora: {
                type: DataTypes.DECIMAL(18,2),
                allowNull: true
            },
            empresa: {
                type: DataTypes.STRING(100)
            }
        },
        {
            timestamps: false,
            tableName: 'tblagua'
        }
    );

    return Agua;
};