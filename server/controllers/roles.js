const { Roles } = require('../models');

const MostrarRoles = async (req, res) =>{

    try{
        const roles = await Roles.findAll();
        res.status(200).json({ roles}); 
    }catch(error){
        console.error('Error en mostrarRoles:', error);
        res.status(500).json({ message: 'Error interno del rol', error: error.message});
    }
}; 


const mostrarRolesActivos = async(req, res) =>{

    try{
        const roles = await Roles.findAll({
            where: {
                activo: true
            }
        });
        res.status(200).json({ roles})
    } catch (error){
        console.error('Error en mostrarRoles:', error);
        res.status(500).json({ message: 'Error interno del rol', error: error.message});

    }
};


const toggleActivoRol = async (req, res) =>{
    const { idrol } = req.params; 

    try{
        // Buscar el rol por su ID
        const rol = await Roles.findByPk(idrol);

        if (!rol) {
            return res.status(404).json({ message: 'Roles no encontrado.'});
        }

        // Alterna el valor de activo
        rol.activo = !rol.activo;

        //Guardar el cambio en la base de datos
        await rol.save(); 

        res.status(200).json({ message: 'Estado del rol actualizado con éxito.', rol });
    } catch (error){
        console.error('Error en toggleActivoRol:', error);
        res.status(500).json({ message: 'Error interno del rol', error: error.message });
    }
};


const crearRol = async (req, res) => {
    try{

        const { rol, activo, clientes, empleados, lotes, servicios, roles, usuarios, pagos, lecturas, configuracion, historial_pagos } = req.body; 
        const nuevoRol = await Roles.create({rol,activo, clientes, empleados, lotes, servicios, roles, usuarios, pagos, lecturas, configuracion, historial_pagos});
        res.status(201).json({nuevoRol});

    } catch (error){
        console.error('Error en crearRol: ', error);
        res.status(400).json({ message: 'Error interno del rol', error: error.message});
    }

};


const actualizarRol = async (req, res) => {
    const { idrol } = req.params;
    const { rol, clientes, empleados, lotes, servicios, roles, usuarios, pagos, lecturas, configuracion, historial_pagos } = req.body;

    try {
        const existe = await Roles.findByPk(idrol);

        if (!existe) {
            return res.status(404).json({ message: 'Rol no encontrado.' });
        }

        await existe.update({ rol, clientes, empleados, lotes, servicios, roles: roles, usuarios, pagos, lecturas, configuracion, historial_pagos});

        res.status(200).json({ message: 'Rol actualizado con éxito.' });
    } catch (error) {
        console.error('Error en actualizarRol:', error);
        res.status(500).json({ message: 'Error interno del rol', error: error.message });
    }
};


const eliminarRol = async (req, res) => {
    const { idrol } = req.params;

    try {
        await Roles.destroy({
            where: { idrol: idrol }
        });

        res.status(200).json({ message: 'Roles eliminado definitivamente con éxito.' });
    } catch (error) {
        console.error('Error en eliminarRol:', error);
        res.status(500).json({ message: 'Error interno del rol', error: error.message });
    }
};




module.exports = {
    MostrarRoles, mostrarRolesActivos, toggleActivoRol, crearRol, actualizarRol, eliminarRol
}; 