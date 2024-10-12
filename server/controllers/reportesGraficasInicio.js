const { lecturas, servicios } = require('../models'); // Importar los modelos que ya tienes
const { sequelize } = require('../models'); // Obtener la instancia de sequelize

// Controlador que retorna las lecturas realizadas y pendientes
const mostrarResumenLecturas = async (req, res) => {
  try {
    const query = `
      SELECT 
        l.mes,
        l.año AS anio,
        COUNT(DISTINCT l.idservicio) AS lecturasRealizadas,
        (
          SELECT COUNT(*) 
          FROM tblservicios s 
          WHERE (s.anio_inicio_lectura < l.año 
              OR (s.anio_inicio_lectura = l.año AND s.mes_inicio_lectura <= l.mes))
        ) - COUNT(DISTINCT l.idservicio) AS lecturasPendientes
      FROM 
        tbllecturas l
      GROUP BY 
        l.mes, l.año;
    `;

    // Ejecutar la consulta directamente en la base de datos
    const [results, metadata] = await sequelize.query(query);

    // Retornar los resultados en la respuesta de la API
    return res.status(200).json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Error en la consulta de lecturas:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener las lecturas'
    });
  }
};


// Controlador que retorna la cantidad de servicios por estatus
const mostrarResumenServicios = async (req, res) => {
  try {
    const query = `
    SELECT
    COUNT(CASE WHEN estatus_contador = 'Pagando' THEN 1 END) AS totalPagando,
    COUNT(CASE WHEN estatus_contador = 'Cortado' THEN 1 END) AS totalCortado,
    COUNT(CASE WHEN estatus_contador = 'Suspendido' THEN 1 END) AS totalSuspendido
    FROM tblservicios;
    `;

    // Ejecutar la consulta directamente en la base de datos
    const [results, metadata] = await sequelize.query(query);

    // Retornar los resultados en la respuesta de la API
    return res.status(200).json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Error en la consulta de servicios:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener las servicios'
    });
  }
};




// Controlador que retorna el resumen de pagos por mes
const mostrarResumenPagos = async (req, res) => {
  try {
    const query = `
    SELECT 
    mes,
    año,
    SUM(cuota) AS totalCuotas,
    SUM(mora) AS totalMoras,
    SUM(monto_exceso) AS totalExcesos
    FROM 
    tblpagos
    GROUP BY 
    mes, año
    ORDER BY 
    año, mes;
    `;

    // Ejecutar la consulta directamente en la base de datos
    const [results, metadata] = await sequelize.query(query);

    // Retornar los resultados en la respuesta de la API
    return res.status(200).json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Error en la consulta de servicios:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener las servicios'
    });
  }
};

module.exports = { mostrarResumenLecturas, mostrarResumenServicios, mostrarResumenPagos };
