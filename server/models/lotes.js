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
        observaciones: {
            type: Datatypes.STRING(255),
            allowNull: true
        },
        activo: {
            type: Datatypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        },
    },
        {
            timestamps: true,
            tableName: 'tbllotes'
        }
    );
    return Lotes;
}