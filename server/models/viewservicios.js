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
            mes_inicio_lectura:{
                type:DataTypes.INTEGER,
                allowNull: false
            },
            anio_inicio_lectura:{
                type:DataTypes.INTEGER,
                allowNull: false
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
            tableName: 'view_servicios',
            freezeTableName: true,
            // Evita que Sequelize intente crear o alterar la vista
            createdAt: false,
            updatedAt: false,
            // Desactiva la sincronización con la base de datos
            sync: { force: false },
            underscored: true
        }
    );

    return ViewServicios;
};
