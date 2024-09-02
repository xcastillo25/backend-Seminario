module.exports = (sequelize, DataTypes) => {
    const ViewServicios = sequelize.define(
        'ViewServices', 
        {
            idservicio: {
                type: DataTypes.INTEGER,
                primaryKey: true
            },
            nombre: {
                type: DataTypes.STRING,
                allowNull: false
            },
            apellidos: {
                type: DataTypes.STRING,
                allowNull: false
            },
            no_titulo: {
                type: DataTypes.STRING,
                allowNull: true
            },
            no_contador: {
                type: DataTypes.STRING,
                allowNull: true
            },
            estatus_contador: {
                type: DataTypes.STRING,
                allowNull: true
            },
            lote: {
                type: DataTypes.STRING,
                allowNull: false
            },
            manzana: {
                type: DataTypes.STRING,
                allowNull: false
            },
            ubicacion: {
                type: DataTypes.STRING,
                allowNull: false
            }
        }, 
        {
            timestamps: false,
            tableName: 'view_services',
            freezeTableName: true
        }
    );

    return ViewServicios;
};
