const { Model } = require("sequelize");
const { FOREIGNKEYS } = require("sequelize/lib/query-types");

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
        uuid: {
            type: Datatypes.STRING,
            unique: true
        },
        activo: {
            type: Datatypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        },
        // Nuevos campos para manejar la mora
        monto_mora: {
            type: Datatypes.DECIMAL(18,2),
            allowNull: true,
            defaultValue: 0.0 // Monto total de mora acumulada
        },
        monto_acumulado: {
            type: Datatypes.DECIMAL(18,2),
            allowNull: true,
            defaultValue: 0.0 // Monto total acumulado (cuotas y mora)
        },
        mora_pagada: {
            type: Datatypes.BOOLEAN,
            allowNull: false,
            defaultValue: false // Indica si la mora ya ha sido pagada
        },
        cuota: {
            type: Datatypes.DECIMAL(18,2),
            allowNull: false,
        },
        cuota_mensual: {
            type: Datatypes.DECIMAL(18,2),
            allowNull: false,
            defaultValue: 0.0 
        },
        // Nuevos campos para manejar los excesos
        exceso: {
            type: Datatypes.DECIMAL(18,2),
            allowNull: true,
            defaultValue: 0.0 // Exceso calculado
        },
        monto_exceso: {
            type: Datatypes.DECIMAL(18,2),
            allowNull: true,
            defaultValue: 0.0 // Monto adicional por exceso
        },
        exceso_pagado: {
            type: Datatypes.BOOLEAN,
            allowNull: false,
            defaultValue: false // Indica si el exceso ha sido pagado
        },
        porcentaje_acumulado: {
            type: Datatypes.DECIMAL(18,2),
            allowNull: true,
            defaultValue: 0.0
        },
        total: {
            type: Datatypes.DECIMAL(18,2),
            allowNull: true,
            defaultValue: 0.0
        },
        suma_total: {
            type: Datatypes.DECIMAL(18,2),
            allowNull: true,
            defaultValue: 0.0
        }
    },
        {
            timestamps: true,
            tableName: 'tbllecturas',
            hooks: {
                beforeUpdate: async (lectura, options) => {
                    // Solo ejecutar si el campo 'lectura' ha sido modificado
                    if (lectura.changed('lectura')) {
                        await sequelize.models.HistorialLecturas.create({
                            idlectura: lectura.idlectura,
                            idusuario_original: lectura._previousDataValues.idusuario,
                            idusuario_editor: lectura.idusuario,
                            lectura_anterior: lectura._previousDataValues.lectura,
                            nueva_lectura: lectura.lectura,
                            fecha: new Date()
                        });
                    }
                }
            }
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
};
