import { apiClient } from "@/lib/axios";
import type { Conversation, ChatMessage } from "@/types";

const mapearMensajeAlFrontend = (mensaje: any): ChatMessage => {
  const nombreRemitente =
    mensaje.senderName || mensaje.sender?.name || "Usuario";
  return {
    id: mensaje.id,
    conversationId: mensaje.conversationId || "",
    senderId: mensaje.senderId || mensaje.sender?.id || "",
    senderName: nombreRemitente,
    senderAvatar:
      mensaje.senderAvatar ||
      mensaje.sender?.avatar ||
      `https://api.dicebear.com/7.x/adventurer/svg?seed=${nombreRemitente}`,
    content: mensaje.content || "",
    type: mensaje.type || "TEXT",
    metadata: mensaje.metadata || null,
    timestamp:
      mensaje.timestamp || mensaje.createdAt || new Date().toISOString(),
    isRead: mensaje.isRead || false,
  };
};

const mapearConversacionAlFrontend = (
  conversacion: any,
  idUsuarioActual: string,
): Conversation => {
  // Encontrar al otro participante en la conversación
  const otroParticipanteObj =
    conversacion.participants?.find((p: any) => String(p.userId) !== String(idUsuarioActual)) ||
    conversacion.recipient ||
    {};
  const otroParticipante = otroParticipanteObj.user || otroParticipanteObj;
  const otroNombre = otroParticipante.name || "Usuario";

  return {
    id: conversacion.id,
    participantIds: conversacion.participants?.map((p: any) => p.userId || p.id) || [
      idUsuarioActual,
      otroParticipante.id || "",
    ],
    participantName: otroNombre,
    participantAvatar:
      otroParticipante.avatarUrl ||
      otroParticipante.avatar ||
      `https://api.dicebear.com/7.x/adventurer/svg?seed=${otroNombre}`,
    lastMessage: conversacion.messages && conversacion.messages.length > 0
      ? conversacion.messages[0].content
      : conversacion.lastMessage || "",
    lastMessageTime: conversacion.messages && conversacion.messages.length > 0
      ? conversacion.messages[0].timestamp || conversacion.messages[0].createdAt
      : conversacion.lastMessageTime || conversacion.updatedAt || new Date().toISOString(),
    unreadCount: conversacion.unreadCount || 0,
    serviceRequest: conversacion.serviceRequest || undefined,
  };
};

export const chatService = {
  async getConversations(id_usuario: string): Promise<Conversation[]> {
    try {
      const respuesta = await apiClient.get<any[]>("/conversations");
      return respuesta.data.map((c) =>
        mapearConversacionAlFrontend(c, id_usuario),
      );
    } catch (error) {
      console.error("Error en chatService.getConversations:", error);
      return [];
    }
  },

  async getMessages(id_conversacion: string): Promise<ChatMessage[]> {
    try {
      const respuesta = await apiClient.get<any>(
        `/conversations/${id_conversacion}`,
      );
      const msgList = Array.isArray(respuesta.data)
        ? respuesta.data
        : (respuesta.data?.messages || []);
      return msgList.map(mapearMensajeAlFrontend);
    } catch (error) {
      console.error(
        `Error en chatService.getMessages(${id_conversacion}):`,
        error,
      );
      return [];
    }
  },

  async startConversation(id_destinatario: string, serviceRequestId?: string | number): Promise<Conversation> {
    const respuesta = await apiClient.post("/conversations", {
      recipientId: id_destinatario,
      serviceRequestId: serviceRequestId
    });
    const idUsuarioActual = localStorage.getItem("platjob_user")
      ? JSON.parse(localStorage.getItem("platjob_user")!).id
      : "";
    return mapearConversacionAlFrontend(respuesta.data, idUsuarioActual);
  },

  async markAsRead(id_conversacion: string): Promise<void> {
    await apiClient.patch(`/conversations/${id_conversacion}/read`);
  },

  async proposeNegotiation(id_conversacion: string, data: { newPrice?: number, newDate?: string }): Promise<ChatMessage> {
    const respuesta = await apiClient.post(`/conversations/${id_conversacion}/negotiate`, data);
    return mapearMensajeAlFrontend(respuesta.data);
  },

  async acceptNegotiation(id_conversacion: string, messageId: string | number): Promise<ChatMessage> {
    const respuesta = await apiClient.post(`/conversations/${id_conversacion}/negotiate/${messageId}/accept`);
    return mapearMensajeAlFrontend(respuesta.data);
  },

  async deleteConversation(id_conversacion: string): Promise<void> {
    await apiClient.delete(`/conversations/${id_conversacion}`);
  }
};
