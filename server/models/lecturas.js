const { Model } = require("sequelize")
const { FOREIGNKEYS } = require("sequelize/lib/query-types")

module.exports = (sequelize, Datatypes) => {
    const Lecturas = sequelize.define(
        "Lecturas", {
        idlectura: {
            type: Datatypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        idservicio: {
            type: Datatypes.INTEGER,
            allowNull: false,
            references:{
                model:'tblservicios',
                key:'idservicio'
            }
        },
        lectura: {
            type: Datatypes.DECIMAL(18,2),
            allowNull: false
        },
        fecha: {
            type: Datatypes.DATE,
            allowNull: false
        },
        mes: {
            type: Datatypes.INTEGER,
            allowNull: false
        },
        año: {
            type: Datatypes.INTEGER,
            allowNull: false
        },
        url_foto: {
            type: Datatypes.STRING,
            allowNull: false
        },
        idusuario: {
            type: Datatypes.INTEGER,
            allowNull: false,
            references: {
                model:'tblusuarios',
                key:'idusuario'
            }
        },
        activo: {
            type: Datatypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        },
        uuid: {
            type: Datatypes.STRING,
            unique: true
        }
    },
    {
        timestamps: true,
        tableName: 'tbllecturas'
    }
    );
    Lecturas.associate = (models) => {
        Lecturas.belongsTo(models.Servicios, {
            foreignKey: 'idservicio',
            as: 'servicios',
        });

        Lecturas.belongsTo(models.Usuarios, {
            foreignKey: 'idusuario',
            as: 'usuarios',
        });

    }
    return Lecturas;
}