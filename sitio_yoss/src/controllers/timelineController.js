/**
 * src/controllers/timelineController.js
 * Controlador para la Historia Cronológica
 */

const TimelineEvent = require('../models/TimelineEvent');

/**
 * GET /api/timeline
 * Obtiene todos los eventos cronológicos ordenados por fecha ascendente.
 */
const getTimelineEvents = async (req, res, next) => {
  try {
    const events = await TimelineEvent.find().sort({ date: 1 });
    
    res.status(200).json({
      success: true,
      count: events.length,
      events,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getTimelineEvents };
