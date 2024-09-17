module.exports = (sequelize, DataTypes) => {
    const ViewLecturas = sequelize.define(
        'ViewLecturas', 
        {
            idlectura: {
                type: DataTypes.INTEGER,
                primaryKey: true
            },
            lectura: {
                type: DataTypes.STRING,
                allowNull: false
            },
            fecha: {
                type: DataTypes.DATE,
                allowNull: false
            },
            idusuario: {
                type: DataTypes.STRING,
                allowNull: true
            },
            no_contador: {
                type: DataTypes.STRING,
                allowNull: true
            },
            ubicacion: {
                type: DataTypes.STRING,
                allowNull: true
            },
            url_foto: {
                type: DataTypes.STRING
            }
        }, 
        {
            timestamps: false,
            tableName: 'view_lecturas',
            freezeTableName: true,
            // Evita que Sequelize intente crear o alterar la vista
            createdAt: false,
            updatedAt: false,
            // Desactiva la sincronización con la base de datos
            sync: { force: false },
            underscored: true
        }
    );

    return ViewLecturas;
};
