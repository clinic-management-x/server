import { Injectable } from "@nestjs/common";
import { Socket } from "socket.io";

@Injectable()
export class SocketService {
    private readonly connectedClients: Map<
        string,
        { socket: Socket; clinicId: string }
    > = new Map();

    handleConnection(socket: Socket, clinicId: string): void {
        const clientId = socket.id;
        this.connectedClients.set(socket.id, { socket, clinicId });

        socket.on("disconnect", () => {
            this.connectedClients.delete(clientId);
        });
    }

    sendNotificationToClinic(
        clinicId: string,
        event: string,
        message: any
    ): void {
        this.connectedClients.forEach((client) => {
            if (client.clinicId === clinicId) {
                client.socket.emit(event, message);
            }
        });
    }
}
