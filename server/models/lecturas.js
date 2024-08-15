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
        idlote: {
            type: Datatypes.INTEGER,
            allowNull: false,
            references:{
                model:'tbllotes',
                key:'idlote'
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
        url_foto: {
            type: Datatypes.STRING(512),
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
        }
    },
        {
            timestamps: false,
            tableName: 'tbllecturas'
        }
    );
    Lecturas.associate = (models) => {
        Lecturas.belongsTo(models.Lotes, {
            foreignKey: 'idlote',
            as: 'lotes',
        });

        Lecturas.belongsTo(models.Usuarios, {
            foreignKey: 'idusuario',
            as: 'usuarios',
        });

    }
    return Lecturas;
}