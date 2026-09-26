package com.javier.Controller;


import com.javier.Sender.Sender;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
@RestController
@RequestMapping("/api/messages")
public class MessageController {

    private final Sender sender;

    public MessageController(Sender sender) {
        this.sender = sender;
    }

    @PostMapping
    public ResponseEntity<String> sendMessage(
            @RequestBody MessageRequest request) {

        try {
            sender.sendMessage(request.getMessage());

            return ResponseEntity.ok(
                    "Mensaje enviado: " + request.getMessage()
            );

        } catch (Exception e) {

            return ResponseEntity.badRequest().body(
                    "Error: " + e.getMessage()
            );
        }
    }

    /**
     * Enviar un mensaje vía GET.
     *
     * Ejemplo:
     *
     * http://localhost:8080/api/messages/send?message=Hello%20World
     */
    @GetMapping("/send")
    public ResponseEntity<String> sendMessageGet(
            @RequestParam(name = "message") String message) {

        try {
            sender.sendMessage(message);

            return ResponseEntity.ok(
                    "Mensaje enviado: " + message
            );

        } catch (Exception e) {

            return ResponseEntity.badRequest().body(
                    "Error: " + e.getMessage()
            );
        }
    }

    /**
     * DTO para recibir el mensaje en formato JSON.
     */
    public static class MessageRequest {

        private String message;

        public MessageRequest() {
        }

        public MessageRequest(String message) {
            this.message = message;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }
    }
}
