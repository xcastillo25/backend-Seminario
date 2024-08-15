module.exports = (sequelize, DataTypes) => {
    const Usuarios = sequelize.define(
        'Usuarios',
        {
            idusuario: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            idpersona: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'tblpersonas',
                    key: 'idpersona'
                }
            },
            usuario: {
                type: DataTypes.STRING(50),
                allowNull: false
            },
            password: {
                type: DataTypes.STRING(255),
                allowNull: false
            },
            idrol: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'tblroles',
                    key: 'idrol'
                }
            },
            activo: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true
            }
        },
        {
            timestamps: false,
        }
    );

     // Asociación con tblconfiguracion
     Usuarios.associate = (models) => {
        Usuarios.belongsTo(models.Personas, {
            foreignKey: 'idpersonas',
            as: 'personas'
        });

        Usuarios.belongsTo(models.Roles, {
            foreignKey: 'idroles',
            as: 'roles'
        });
    };

    return Usuarios;
};
