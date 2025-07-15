// Configuración centralizada de animaciones
export const ANIMATIONS = {
  // Animaciones de entrada
  fadeIn: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" }
  },

  fadeInUp: {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, ease: "easeOut" }
  },

  fadeInDown: {
    initial: { opacity: 0, y: -30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, ease: "easeOut" }
  },

  fadeInLeft: {
    initial: { opacity: 0, x: -30 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.7, ease: "easeOut" }
  },

  fadeInRight: {
    initial: { opacity: 0, x: 30 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.7, ease: "easeOut" }
  },

  // Animaciones escalonadas (para efectos cascada)
  staggerContainer: {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  },

  // Animaciones de iconos
  iconRotate: {
    initial: { rotate: -180, opacity: 0 },
    animate: { rotate: 0, opacity: 1 },
    transition: { duration: 0.8, ease: "easeOut" }
  },

  iconBounce: {
    initial: { scale: 0, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    transition: { 
      duration: 0.6, 
      ease: "easeOut",
      type: "spring",
      stiffness: 200
    }
  },

  // Animaciones de botones
  buttonHover: {
    scale: 1.03,
    transition: { duration: 0.3, ease: "easeInOut" }
  },

  buttonTap: {
    scale: 0.97,
    transition: { duration: 0.15, ease: "easeInOut" }
  },

  // Animaciones específicas para botones PDF
  pdfButtonReady: {
    animate: {
      scale: [1, 1.02, 1],
      boxShadow: [
        "0 4px 12px rgba(25,118,210,0.3)",
        "0 6px 20px rgba(25,118,210,0.5)",
        "0 4px 12px rgba(25,118,210,0.3)"
      ],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  },

  openButtonReady: {
    animate: {
      scale: [1, 1.02, 1],
      boxShadow: [
        "0 4px 12px rgba(46,125,50,0.3)",
        "0 6px 20px rgba(46,125,50,0.5)",
        "0 4px 12px rgba(46,125,50,0.3)"
      ],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  },

  buttonSuccess: {
    initial: { scale: 1 },
    animate: { 
      scale: [1, 1.1, 1],
      transition: {
        duration: 0.6,
        ease: "easeInOut"
      }
    }
  },

  buttonClick: {
    initial: { scale: 1 },
    animate: { 
      scale: [1, 0.97, 1.02, 1],
      transition: {
        duration: 0.4,
        ease: "easeInOut"
      }
    }
  },

  // Animación sutil para botones activos (sin esquinas)
  buttonActive: {
    animate: {
      filter: "brightness(1.1)",
      transition: {
        duration: 1.5,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut"
      }
    }
  },

  // Animaciones de cards
  cardHover: {
    y: -5,
    transition: { duration: 0.3, ease: "easeInOut" }
  },

  // Animaciones de carga
  loadingPulse: {
    animate: {
      scale: [1, 1.1, 1],
      opacity: [0.7, 1, 0.7],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  },

  // Animación de spinner rotatorio
  loadingSpinner: {
    animate: {
      rotate: 360,
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: "linear"
      }
    }
  },

  // Animación de éxito (checkmark)
  successCheck: {
    initial: { scale: 0, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 10
    }
  },

  // Animación de error (shake)
  errorShake: {
    animate: {
      x: [-10, 10, -10, 10, -5, 5, -2, 2, 0],
      transition: {
        duration: 0.6,
        ease: "easeInOut"
      }
    }
  },

  // Animación de alerta (pulse rojo)
  alertPulse: {
    animate: {
      scale: [1, 1.05, 1],
      boxShadow: [
        "0 0 0 0 rgba(255, 0, 0, 0.7)",
        "0 0 0 10px rgba(255, 0, 0, 0)",
        "0 0 0 0 rgba(255, 0, 0, 0)"
      ],
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  },

  // Animación de progreso (barra de carga)
  progressBar: {
    initial: { width: 0 },
    animate: { width: "100%" },
    transition: {
      duration: 2,
      ease: "easeInOut"
    }
  },

  // Animación de notificación (slide in)
  notificationSlide: {
    initial: { x: 300, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: 300, opacity: 0 },
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  },

  // Animación de transición de tema
  themeTransition: {
    transition: { duration: 0.3, ease: "easeInOut" }
  },

  // Animaciones específicas para formularios
  formFieldFocus: {
    scale: 1.02,
    transition: { duration: 0.3, ease: "easeInOut" }
  },

  formFieldHover: {
    scale: 1.01,
    transition: { duration: 0.2, ease: "easeInOut" }
  },

  formFieldValid: {
    animate: {
      scale: [1, 1.05, 1],
      boxShadow: [
        "0 0 0 0 rgba(76, 175, 80, 0)",
        "0 0 0 8px rgba(76, 175, 80, 0.3)",
        "0 0 0 0 rgba(76, 175, 80, 0)"
      ],
      transition: {
        duration: 0.6,
        ease: "easeInOut"
      }
    }
  },

  formFieldError: {
    animate: {
      x: [-10, 10, -10, 10, -5, 5, 0],
      transition: {
        duration: 0.6,
        ease: "easeInOut"
      }
    }
  },

  placeholderFloat: {
    animate: {
      y: [-2, 2, -2],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  },

  selectOptionHover: {
    scale: 1.02,
    backgroundColor: "rgba(255,255,255,0.1)",
    transition: { duration: 0.2, ease: "easeInOut" }
  }
};

// Variantes para animaciones escalonadas específicas
export const STAGGER_VARIANTS = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

// Variantes para elementos individuales en animaciones escalonadas
export const STAGGER_ITEM_VARIANTS = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
}; 