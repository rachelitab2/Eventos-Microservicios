package com.eventos.event_service;

import com.eventos.event_service.entity.Event;
import com.eventos.event_service.repository.EventRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.time.LocalDateTime;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final EventRepository eventRepository;

    public DataInitializer(EventRepository eventRepository) {
        this.eventRepository = eventRepository;
    }

    @Override
    public void run(String... args) {
        if (eventRepository.count() == 0) {
            eventRepository.saveAll(buildEvents());
            System.out.println("✅ 10 eventos de Punta Cana 2026 cargados exitosamente.");
        }
    }

    private List<Event> buildEvents() {

        Event e1 = new Event();
        e1.setName("Festival Gastronómico del Caribe 2026");
        e1.setDescription("Gran feria culinaria con chefs internacionales y platos típicos dominicanos. Disfruta de mariscos frescos, mofongos y postres criollos frente al mar Caribe.");
        e1.setLocation("Playa Bávaro, Hard Rock Hotel & Casino, Punta Cana");
        e1.setEventDate(LocalDateTime.of(2026, 4, 18, 12, 0));
        e1.setTotalCapacity(500);
        e1.setAvailableSpots(500);
        e1.setCategory("Gastronomía");
        e1.setPrice(25.00);
        e1.setImageUrl("https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800");
        e1.setInstagramUrl("https://instagram.com/festivalgastronomico");
        e1.setInstagramUser("@festivalgastronomico");

        Event e2 = new Event();
        e2.setName("Torneo de Kitesurf Punta Cana Open 2026");
        e2.setDescription("Competencia internacional de kitesurf en las aguas turquesas de El Cortecito. Participantes de más de 15 países compiten por el título del Caribe.");
        e2.setLocation("Playa El Cortecito, Bávaro, Punta Cana");
        e2.setEventDate(LocalDateTime.of(2026, 5, 10, 9, 0));
        e2.setTotalCapacity(300);
        e2.setAvailableSpots(300);
        e2.setCategory("Deportes");
        e2.setPrice(0.00);
        e2.setImageUrl("https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800");
        e2.setInstagramUrl("https://instagram.com/kitesurfpuntacana");
        e2.setInstagramUser("@kitesurfpuntacana");
        e2.setWhatsappNumber("+18095551234");

        Event e3 = new Event();
        e3.setName("Noche de Merengue y Bachata 2026");
        e3.setDescription("Gran velada musical con las mejores orquestas del país. Baile, música en vivo y coctelería dominicana bajo las estrellas del Caribe.");
        e3.setLocation("Barceló Bávaro Palace, Punta Cana");
        e3.setEventDate(LocalDateTime.of(2026, 5, 23, 20, 0));
        e3.setTotalCapacity(400);
        e3.setAvailableSpots(400);
        e3.setCategory("Música");
        e3.setPrice(35.00);
        e3.setImageUrl("https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800");
        e3.setFacebookUrl("https://facebook.com/nochemusicalpc");
        e3.setFacebookUser("Noche Musical Punta Cana");

        Event e4 = new Event();
        e4.setName("Excursión de Snorkel en Isla Saona 2026");
        e4.setDescription("Aventura acuática para descubrir los arrecifes de coral y peces tropicales en la paradisíaca Isla Saona. Incluye almuerzo y bebidas.");
        e4.setLocation("Embarcadero Bayahibe, salida desde Punta Cana");
        e4.setEventDate(LocalDateTime.of(2026, 6, 6, 8, 0));
        e4.setTotalCapacity(60);
        e4.setAvailableSpots(60);
        e4.setCategory("Turismo");
        e4.setPrice(85.00);
        e4.setImageUrl("https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800");
        e4.setWhatsappNumber("+18095559876");
        e4.setInstagramUrl("https://instagram.com/saonaislandtour");
        e4.setInstagramUser("@saonaislandtour");

        Event e5 = new Event();
        e5.setName("Torneo de Golf Punta Cana Classic 2026");
        e5.setDescription("Torneo amateur de golf en uno de los campos más exclusivos del Caribe, rodeado de palmeras y con vista al mar turquesa de Cap Cana.");
        e5.setLocation("Punta Cana Golf Club, Cap Cana");
        e5.setEventDate(LocalDateTime.of(2026, 6, 20, 7, 0));
        e5.setTotalCapacity(120);
        e5.setAvailableSpots(120);
        e5.setCategory("Deportes");
        e5.setPrice(150.00);
        e5.setImageUrl("https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=800");
        e5.setFacebookUrl("https://facebook.com/golfpuntacana");
        e5.setFacebookUser("Golf Punta Cana Classic");

        Event e6 = new Event();
        e6.setName("Feria Artesanal Dominicana 2026");
        e6.setDescription("Exposición y venta de artesanías típicas dominicanas: larimar, ámbar, pinturas y tejidos. Ideal para turistas y coleccionistas de arte caribeño.");
        e6.setLocation("Boulevard Bávaro, Punta Cana");
        e6.setEventDate(LocalDateTime.of(2026, 7, 4, 10, 0));
        e6.setTotalCapacity(200);
        e6.setAvailableSpots(200);
        e6.setCategory("Cultura");
        e6.setPrice(0.00);
        e6.setImageUrl("https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800");
        e6.setInstagramUrl("https://instagram.com/feriaartesanalrd");
        e6.setInstagramUser("@feriaartesanalrd");
        e6.setFacebookUrl("https://facebook.com/feriaartesanalrd");
        e6.setFacebookUser("Feria Artesanal Dominicana");

        Event e7 = new Event();
        e7.setName("Show de Fuegos Artificiales Bávaro 2026");
        e7.setDescription("Espectáculo nocturno de fuegos artificiales sobre el mar Caribe. El mejor cierre para unas vacaciones inolvidables en Bávaro.");
        e7.setLocation("Playa Bávaro, frente al Riu Palace, Punta Cana");
        e7.setEventDate(LocalDateTime.of(2026, 7, 25, 21, 0));
        e7.setTotalCapacity(1000);
        e7.setAvailableSpots(1000);
        e7.setCategory("Entretenimiento");
        e7.setPrice(20.00);
        e7.setImageUrl("https://images.unsplash.com/photo-1498931299472-f7a63a5a1cfa?w=800");
        e7.setInstagramUrl("https://instagram.com/fuegosartificialespcd");
        e7.setInstagramUser("@fuegosartificialespcd");
        e7.setWhatsappNumber("+18095554321");

        Event e8 = new Event();
        e8.setName("Clínica de Surf en Playa Macao 2026");
        e8.setDescription("Aprende a surfear con instructores certificados en las olas de Macao Beach. Incluye tabla, traje y fotografías profesionales del día.");
        e8.setLocation("Playa Macao, Punta Cana");
        e8.setEventDate(LocalDateTime.of(2026, 8, 8, 9, 0));
        e8.setTotalCapacity(30);
        e8.setAvailableSpots(30);
        e8.setCategory("Deportes");
        e8.setPrice(60.00);
        e8.setImageUrl("https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=800");
        e8.setInstagramUrl("https://instagram.com/surfmacaopc");
        e8.setInstagramUser("@surfmacaopc");
        e8.setTiktokUrl("https://tiktok.com/@surfmacaopc");
        e8.setTiktokUser("@surfmacaopc");

        Event e9 = new Event();
        e9.setName("Cena Romántica bajo las Estrellas 2026");
        e9.setDescription("Cena privada para parejas en la orilla del mar con chef personal, decoración floral, música en vivo y vista al atardecer caribeño en Cap Cana.");
        e9.setLocation("Playa Juanillo, Cap Cana, Punta Cana");
        e9.setEventDate(LocalDateTime.of(2026, 9, 12, 19, 0));
        e9.setTotalCapacity(50);
        e9.setAvailableSpots(50);
        e9.setCategory("Romántico");
        e9.setPrice(120.00);
        e9.setImageUrl("https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800");
        e9.setInstagramUrl("https://instagram.com/cenaromanticalpc");
        e9.setInstagramUser("@cenaromanticalpc");
        e9.setWhatsappNumber("+18095557890");

        Event e10 = new Event();
        e10.setName("Tour Ecológico por Los Haitises 2026");
        e10.setDescription("Expedición en bote por el Parque Nacional Los Haitises. Explora manglares, cuevas con pinturas taínas y una biodiversidad única del Caribe.");
        e10.setLocation("Sabana de la Mar, salida desde Punta Cana");
        e10.setEventDate(LocalDateTime.of(2026, 10, 3, 7, 0));
        e10.setTotalCapacity(40);
        e10.setAvailableSpots(40);
        e10.setCategory("Ecoturismo");
        e10.setPrice(95.00);
        e10.setImageUrl("https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800");
        e10.setInstagramUrl("https://instagram.com/haitisestour");
        e10.setInstagramUser("@haitisestour");
        e10.setFacebookUrl("https://facebook.com/haitisestour");
        e10.setFacebookUser("Los Haitises Tour");
        e10.setWhatsappNumber("+18095556789");

        return List.of(e1, e2, e3, e4, e5, e6, e7, e8, e9, e10);
    }
}
