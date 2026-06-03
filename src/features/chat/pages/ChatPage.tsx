import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { Avatar, Button, Input, Card, CardContent, } from "@/components/ui/HeroUICompat";
import { motion, AnimatePresence } from "framer-motion";
import { Send, MessageSquare, Briefcase, Calendar, DollarSign, Handshake } from "lucide-react";
import { chatService } from "@/services";
import { useAuthStore } from "@/store";
import type { ChatMessage, Conversation } from "@/types";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeletons";
import { usePageTitle, useSocket } from "@/hooks";
import { formatRelativeTime } from "@/utils";
import clsx from "clsx";

export default function ChatPage() {
  usePageTitle("Chat");
  const { user } = useAuthStore();
  const location = useLocation();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isLoadingConvs, setIsLoadingConvs] = useState(true);
  const [isLoadingMsgs, setIsLoadingMsgs] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Negotiation state
  const [isNegotiating, setIsNegotiating] = useState(false);
  const [newPrice, setNewPrice] = useState("");
  const [newDate, setNewDate] = useState("");

  const { sendMessage, socket } = useSocket(activeConvId);

  useEffect(() => {
    if (!user?.id) return;
    chatService.getConversations(user.id).then((data) => {
      setConversations(data);
      const passedConvId = location.state?.activeConversationId;
      if (passedConvId) {
        setActiveConvId(passedConvId);
      } else if (data.length > 0) {
        setActiveConvId(data[0].id);
      }
      setIsLoadingConvs(false);
    });
  }, [user?.id, location.state]);

  useEffect(() => {
    if (!activeConvId) return;
    setIsLoadingMsgs(true);
    chatService.getMessages(activeConvId).then((data) => {
      setMessages(data);
      setIsLoadingMsgs(false);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    });
    chatService.markAsRead(activeConvId).catch(console.error);
  }, [activeConvId]);

  // Listen to message_received event via socket.io
  useEffect(() => {
    if (!socket) return;

    const handleMessageReceived = (msg: any) => {
      const senderName = msg.senderName || msg.sender?.name || "Usuario";
      const newMsg: ChatMessage = {
        id: msg.id || `msg-${Date.now()}`,
        conversationId: msg.conversationId,
        senderId: msg.senderId || msg.sender?.id || "",
        senderName,
        senderAvatar: msg.senderAvatar || msg.sender?.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${senderName}`,
        content: msg.content,
        type: msg.type || "TEXT",
        metadata: msg.metadata || null,
        timestamp: msg.timestamp || msg.createdAt || new Date().toISOString(),
        isRead: msg.isRead || false,
      };

      if (msg.conversationId === activeConvId) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
      }

      setConversations((prev) =>
        prev.map((c) =>
          c.id === msg.conversationId
            ? {
              ...c,
              lastMessage: msg.content,
              lastMessageTime: new Date().toISOString(),
              unreadCount: msg.conversationId === activeConvId ? 0 : c.unreadCount + 1,
            }
            : c
        )
      );
    };

    socket.on("message_received", handleMessageReceived);

    return () => {
      socket.off("message_received", handleMessageReceived);
    };
  }, [socket, activeConvId]);

  const handleSend = () => {
    if (!input.trim() || !user || !activeConvId) return;

    sendMessage(activeConvId, input.trim());
    setInput("");
  };

  const handleProposeNegotiation = async () => {
    if (!activeConvId || (!newPrice && !newDate)) return;
    try {
      const msg = await chatService.proposeNegotiation(activeConvId, {
        newPrice: newPrice ? Number(newPrice) : undefined,
        newDate: newDate ? newDate : undefined
      });
      setMessages(prev => [...prev, msg]);
      setIsNegotiating(false);
      setNewPrice("");
      setNewDate("");
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      // Trigger a socket refresh just in case
      socket?.emit("send_message", { conversationId: activeConvId, content: "Nueva propuesta de negociación enviada." });
    } catch (e: any) {
      alert("Error: " + e.message);
    }
  };

  const handleAcceptNegotiation = async (msgId: string | number) => {
    if (!activeConvId) return;
    try {
      const msg = await chatService.acceptNegotiation(activeConvId, msgId);
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, type: "NEGOTIATION_ACCEPTED" } : m));
      setMessages(prev => [...prev, msg]);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      socket?.emit("send_message", { conversationId: activeConvId, content: "Propuesta aceptada." });
    } catch (e: any) {
      alert("Error: " + e.message);
    }
  };

  const activeConv = conversations.find((c) => c.id === activeConvId);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-3xl font-black text-text-primary mb-6">Chat</h1>

      <div className="flex gap-4 h-[calc(100vh-260px)] min-h-[500px]">
        {/* Conversations sidebar */}
        <Card className="w-80 flex-shrink-0 border border-gray-100 shadow-brand-sm hidden sm:flex flex-col">
          <CardContent className="p-0 flex flex-col h-full overflow-hidden">
            <div className="p-4 border-b border-gray-50">
              <p className="font-bold text-text-primary text-sm">Conversaciones</p>
            </div>
            <div className="flex-1 overflow-y-auto">
              {isLoadingConvs
                ? [1, 2, 3].map((i) => (
                  <div key={i} className="p-3 flex gap-3 items-center">
                    <Skeleton className="w-10 h-10" rounded="full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-3 w-3/4" />
                      <Skeleton className="h-2 w-1/2" />
                    </div>
                  </div>
                ))
                : conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setActiveConvId(conv.id)}
                    className={clsx(
                      "w-full p-4 flex gap-4 items-center text-left transition-all border-b border-gray-50 relative group",
                      activeConvId === conv.id ? "bg-brand-blue/[0.03]" : "hover:bg-gray-50/80"
                    )}
                  >
                    {activeConvId === conv.id && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-blue" />
                    )}
                    <div className="relative flex-shrink-0">
                      <Avatar src={conv.participantAvatar} name={conv.participantName} size="sm" />
                      {conv.unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-orange text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <p className="font-bold text-sm text-text-primary truncate">{conv.participantName}</p>
                        <span className="text-[10px] text-text-muted flex-shrink-0">
                          {formatRelativeTime(conv.lastMessageTime)}
                        </span>
                      </div>
                      <p className="text-xs text-text-secondary truncate line-clamp-1">{conv.lastMessage}</p>
                    </div>
                  </button>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Messages panel */}
        <Card className="flex-1 border border-gray-100 shadow-brand-sm flex flex-col">
          <CardContent className="p-0 flex flex-col h-full">
            {/* Header */}
            {activeConv && (
              <div className="p-4 border-b border-gray-100 flex items-center gap-3 bg-white">
                <Avatar src={activeConv.participantAvatar} name={activeConv.participantName} size="sm" />
                <div>
                  <p className="font-bold text-sm text-text-primary">{activeConv.participantName}</p>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-400" />
                    <span className="text-xs text-green-600 font-medium">En línea</span>
                  </div>
                </div>
              </div>
            )}

            {/* Service Request Context Banner */}
            {activeConv?.serviceRequest && (
              <div className="bg-brand-blue/5 border-b border-brand-blue/10 p-3 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-brand-blue font-bold text-sm">
                  <Briefcase className="w-4 h-4" />
                  <span>Servicio: {activeConv.serviceRequest.title}</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-text-secondary">
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5" />
                    Tarifa Actual: Bs {activeConv.serviceRequest.agreedRate || activeConv.serviceRequest.budget || 0}
                  </div>
                  {activeConv.serviceRequest.scheduledDate && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Fecha: {new Date(activeConv.serviceRequest.scheduledDate).toLocaleDateString()}
                    </div>
                  )}
                  <div className="flex items-center gap-1 ml-auto">
                    <span className="bg-brand-blue/10 text-brand-blue px-2 py-0.5 rounded-full font-medium">
                      {activeConv.serviceRequest.status}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-surface/50">
              {isLoadingMsgs ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className={clsx("flex", i % 2 === 0 ? "justify-end" : "")}>
                      <Skeleton className={clsx("h-12 rounded-2xl", i % 2 === 0 ? "w-48" : "w-64")} />
                    </div>
                  ))}
                </div>
              ) : messages.length === 0 ? (
                <EmptyState icon={MessageSquare} title="Sin mensajes" description="Inicia la conversación" />
              ) : (
                <AnimatePresence>
                  {messages.map((msg) => {
                    const isMine = msg.senderId === user?.id;
                    return (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={clsx("flex gap-2", isMine ? "flex-row-reverse" : "")}
                      >
                        {!isMine && (
                          <Avatar src={msg.senderAvatar} name={msg.senderName} size="xs" className="flex-shrink-0 mt-auto" />
                        )}
                        <div className={clsx(
                          "max-w-[72%] px-4 py-2.5 text-sm leading-relaxed shadow-sm",
                          isMine ? "chat-bubble-sent" : "chat-bubble-received",
                          msg.type?.startsWith("NEGOTIATION") && "w-full sm:w-[320px] p-0 overflow-hidden"
                        )}>
                          {msg.type === "NEGOTIATION_PROPOSAL" ? (
                            <div className="p-4 bg-white text-text-primary rounded-xl border border-brand-blue/20">
                              <div className="flex items-center gap-2 font-bold mb-2 text-brand-blue">
                                <Handshake className="w-4 h-4" /> Nueva Propuesta
                              </div>
                              <p className="text-xs mb-3">Se ha propuesto modificar los detalles del servicio.</p>
                              {msg.metadata && JSON.parse(msg.metadata).newPrice && (
                                <div className="text-sm font-medium">💰 Nueva Tarifa: Bs {JSON.parse(msg.metadata).newPrice}</div>
                              )}
                              {msg.metadata && JSON.parse(msg.metadata).newDate && (
                                <div className="text-sm font-medium mt-1">📅 Nueva Fecha: {new Date(JSON.parse(msg.metadata).newDate).toLocaleString()}</div>
                              )}
                              {!isMine && (
                                <div className="mt-4 flex gap-2">
                                  <Button size="sm" className="flex-1 bg-brand-gradient text-white font-bold" onPress={() => handleAcceptNegotiation(msg.id)}>
                                    Aceptar
                                  </Button>
                                </div>
                              )}
                            </div>
                          ) : msg.type === "NEGOTIATION_ACCEPTED" ? (
                            <div className="p-3 bg-green-50 text-green-700 rounded-xl border border-green-200">
                              <div className="flex items-center gap-2 font-bold text-sm">
                                <Handshake className="w-4 h-4" /> Propuesta Aceptada
                              </div>
                            </div>
                          ) : msg.type === "SYSTEM" ? (
                            <div className="text-center italic text-xs text-text-muted">
                              {msg.content}
                            </div>
                          ) : (
                            msg.content
                          )}

                          {msg.type !== "SYSTEM" && (
                            <div className={clsx("text-[10px] mt-1 text-right", isMine ? "text-white/60" : "text-text-muted")}>
                              {formatRelativeTime(msg.timestamp)}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-100 bg-white">
              <div className="flex gap-3">
                {activeConv?.serviceRequest && (
                  <div className="relative">
                    <Button
                      isIconOnly
                      variant="flat"
                      className="bg-brand-orange/10 text-brand-orange hover:bg-brand-orange/20 rounded-xl w-12 h-12 flex-shrink-0"
                      onPress={() => setIsNegotiating(!isNegotiating)}
                    >
                      <Handshake className="w-5 h-5" />
                    </Button>

                    <AnimatePresence>
                      {isNegotiating && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute bottom-full left-0 mb-2 w-72 p-4 bg-white rounded-xl shadow-brand-lg border border-gray-100 z-50"
                        >
                          <div className="flex flex-col gap-3 w-full">
                            <p className="font-bold text-sm">Proponer Negociación</p>
                            <Input
                              label="Nueva Tarifa (Bs)"
                              size="sm"
                              type="number"
                              value={newPrice}
                              onValueChange={setNewPrice}
                              placeholder="Ej. 120"
                            />
                            <Input
                              label="Nueva Fecha"
                              size="sm"
                              type="datetime-local"
                              value={newDate}
                              onValueChange={setNewDate}
                            />
                            <Button className="w-full bg-brand-gradient text-white font-bold rounded-xl" onPress={handleProposeNegotiation}>
                              Enviar Propuesta
                            </Button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
                <Input
                  value={input}
                  onValueChange={setInput}
                  placeholder="Escribe un mensaje..."
                  variant="bordered"
                  className="flex-1"
                  classNames={{ inputWrapper: "border-gray-200 hover:border-brand-blue focus-within:border-brand-blue rounded-xl" }}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                />
                <Button
                  isIconOnly
                  onPress={handleSend}
                  isDisabled={!input.trim()}
                  aria-label="Enviar mensaje"
                  className="bg-brand-gradient text-white rounded-xl w-12 h-12 flex-shrink-0 shadow-brand hover:shadow-brand-lg transition-all disabled:opacity-40"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
