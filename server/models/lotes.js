const { Model } = require("sequelize")
const { FOREIGNKEYS } = require("sequelize/lib/query-types")

module.exports = (sequelize, Datatypes) => {
    const Lotes = sequelize.define(
        "Lotes", {
        idlote: {
            type: Datatypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        manzana: {
            type: Datatypes.STRING(2),
            allowNull: false
        },
        lote: {
            type: Datatypes.INTEGER,
            allowNull: false
        },
        idpersona: {
            type: Datatypes.INTEGER,
            allowNull: false,
            references: {
                model: 'tblpersonas',
                key: 'idpersona'
            }
        },
        idservicio: {
            type: Datatypes.INTEGER,
            allowNull: false,
            references: {
                model: 'tblservicios',
                key: 'idservicio'
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
            tableName: 'tbllotes'
        }
    );
    Lotes.associate = (models) => {
        Lotes.belongsTo(models.Servicios, {
            foreignKey: 'idservicio',
            as: 'servicios',
        });

        Lotes.belongsTo(models.Personas, {
            foreignKey: 'idpersona',
            as: 'personas',
        });

    }
    return Lotes;
}