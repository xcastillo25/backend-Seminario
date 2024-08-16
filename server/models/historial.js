module.exports = (Sequelize, DataTypes) => {
    const Historial = Sequelize.define(
        'Historial', {
        idhistorial: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        fecha: {
            type: DataTypes.DATE,
            allowNull: false
        },
        idusuario: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'tblusuarios',
                key: 'idusuario'
            }
        },
        accion: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        activo: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        },
    },
        {
            timestamps: false,
            tableName: 'tblhistorial'
        }
    );

    Historial.associate = (models) => {
        Historial.belongsTo(models.Usuarios, {
            foreignKey: 'idusuario',
            as: 'usuarios'
        });
    }
    return Historial;

}