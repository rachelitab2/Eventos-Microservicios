USE event_db;

-- Limpiar eventos previos (opcional)
-- DELETE FROM events;

INSERT INTO events (
    name, description, location, event_date, 
    total_capacity, available_spots, category, price, 
    image_url, active, created_at
) VALUES 
(
    'Sunset Catamaran VIP', 
    'Disfruta de la mejor puesta de sol en las costas de Bavaro abordo de nuestro catamaran de lujo. Incluye barra libre premium, aperitivos y musica en vivo con DJ local. Una experiencia exclusiva para crear recuerdos inolvidables en el Caribe.',
    'Marina Cap Cana, Punta Cana', 
    '2026-05-15 17:00:00', 
    40, 40, 'Aventura premium', 120.00, 
    'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1000&q=80',
    true, NOW()
),
(
    'Caribbean Beach Festival', 
    'El festival de musica electronica y urbana mas esperado de la temporada. Escenarios frente al mar, areas VIP con camas balinesas y line-up con artistas internacionales. Baila bajo las estrellas hasta el amanecer en la arena blanca.',
    'Playa Juanillo, Cap Cana', 
    '2026-06-20 20:00:00', 
    2000, 2000, 'Musica en vivo', 85.00, 
    'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=1000&q=80',
    true, NOW()
),
(
    'Cena Clandestina: Sabores del Mar', 
    'Una experiencia gastronomica secreta de 5 tiempos preparada por un Chef con Estrella Michelin. Locacion privada frente a la playa iluminada con velas y maridaje de vinos de alta gama. Descubre el verdadero sabor gourmet del marisco local.',
    'Locacion Secreta, Punta Cana', 
    '2026-04-10 19:30:00', 
    30, 30, 'Cultura y sabor', 150.00, 
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1000&q=80',
    true, NOW()
),
(
    'Expedicion Isla Saona VIP', 
    'Viaje en lancha rapida hacia la paradisiaca Isla Saona. Relajate en aguas cristalinas, conoce la piscina natural de estrellas de mar y disfruta de un exclusivo almuerzo tipo buffet con langosta a la parrilla y champagne.',
    'Bayahibe (Salida desde Punta Cana)', 
    '2026-04-25 08:00:00', 
    25, 25, 'Aventura premium', 135.00, 
    'https://images.unsplash.com/photo-1590847983652-32b0ecbb8dfd?auto=format&fit=crop&w=1000&q=80',
    true, NOW()
),
(
    'Noche de Merengue y Bachata', 
    'Siente el verdadero ritmo dominicano en la pista de baile. Clases introductorias de baile, banda en vivo tocando los clasicos del merengue y bachata, y cocteles tropicales toda la noche.',
    'Downtown Punta Cana', 
    '2026-05-02 21:00:00', 
    300, 300, 'Cultura y sabor', 25.00, 
    'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1000&q=80',
    true, NOW()
),
(
    'Retiro de Yoga Amanecer Caribeño', 
    'Desconecta tu mente y cuerpo en un retiro matutino de yoga frente al mar curado por instructores certificados. Incluye desayuno saludable a base de frutas locales, bowls de acai y jugos detox prensados al frio.',
    'Playa Macao, Punta Cana', 
    '2026-04-18 06:30:00', 
    50, 50, 'Bienestar', 45.00, 
    'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1000&q=80',
    true, NOW()
),
(
    'Buceo en Arrecifes de Coral', 
    'Explora la vida marina vibrante de la Republica Dominicana. Excursion guiada de buceo para todos los niveles: desde principiantes hasta certificados. Todo el equipo incluido, junto a fotografias submarinas profesionales.',
    'Bavaro Reef', 
    '2026-05-12 09:00:00', 
    15, 15, 'Aventura premium', 90.00, 
    'https://images.unsplash.com/photo-1682687982501-1e58f8147c64?auto=format&fit=crop&w=1000&q=80',
    true, NOW()
),
(
    'Ruta del Ron & Tabaco Premium', 
    'Un tour inmersivo por la cultura artesanal dominicana. Visita fabricas de puros hechos a mano, cata rones añejados exclusivos y aprende de los maestros tabaqueros. Incluye puros de regalo y botellas para adquirir a precio de fabrica.',
    'Higuey y Bavaro', 
    '2026-06-05 14:00:00', 
    20, 20, 'Cultura y sabor', 65.00, 
    'https://images.unsplash.com/photo-1510803444453-61b65e7552fc?auto=format&fit=crop&w=1000&q=80',
    true, NOW()
),
(
    'Cena Blanca bajo las Estrellas', 
    'Un evento exclusivo donde todos visten de blanco. Mesas finamente decoradas en la playa, menu internacional de 4 tiempos y musica clasica en vivo (violinistas y violonchelos). Una vibra elegante y magica.',
    'Playa Blanca, Puntacana Resort', 
    '2026-07-15 19:00:00', 
    100, 100, 'Musica en vivo', 180.00, 
    'https://images.unsplash.com/photo-1522413452208-996ff3f3e740?auto=format&fit=crop&w=1000&q=80',
    true, NOW()
),
(
    'Pool Party Tropical Paradise', 
    'Fiesta de dia en una de las piscinas infinitas mas espectaculares de Bavaro. Cockteles de autor, DJs invitados, animacion en piscina, inflables gigantes y un ambiente vibrante rodeado de palmeras.',
    'Hard Rock Hotel, Punta Cana', 
    '2026-04-30 13:00:00', 
    500, 500, 'Musica en vivo', 55.00, 
    'https://images.unsplash.com/photo-1510414008770-98fc1a10058e?auto=format&fit=crop&w=1000&q=80',
    true, NOW()
);
