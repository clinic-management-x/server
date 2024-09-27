import {
    WebSocketGateway,
    OnGatewayConnection,
    WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { SocketService } from "./socket.service";

@WebSocketGateway({
    cors: {
        origin: "*",
    },
})
export class SocketGateway implements OnGatewayConnection {
    @WebSocketServer()
    private server: Server;

    constructor(private readonly socketService: SocketService) {}

    handleConnection(socket: Socket): void {
        const clinicId = socket.handshake.query.clinicId as string;

        this.socketService.handleConnection(socket, clinicId);
    }

    emitNotification(clinicId: string, message: string): void {
        console.log("HIIII");
        this.socketService.sendNotificationToClinic(
            clinicId,
            "notification",
            message
        );
    }
}
