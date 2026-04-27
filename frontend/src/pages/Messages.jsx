import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Loader2,
  MessageCircle,
  Search,
  SendHorizontal,
} from "lucide-react";
import toast from "react-hot-toast";
import Avatar from "../components/Avatar";
import { getAllUsers } from "../services/userService";
import {
  getConversations,
  getMessagesWithUser,
  sendDirectMessage,
} from "../services/messageService";
import { useAuth } from "../context/useAuth";
import { useSocket } from "../context/useSocket";

function Messages() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { subscribeToMessages } = useSocket();

  const [conversations, setConversations] = useState([]);
  const [conversationsLoading, setConversationsLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState("");
  const [searchUsers, setSearchUsers] = useState([]);

  const activeConversation = useMemo(
    () =>
      conversations.find(
        (conversation) => conversation.otherUser?._id === userId,
      ) || null,
    [conversations, userId],
  );

  const activeUser = activeConversation?.otherUser || null;

  const fetchConversations = useCallback(async () => {
    try {
      setConversationsLoading(true);
      const res = await getConversations();
      setConversations(res.data.conversations || []);
    } catch {
      toast.error("Failed to load conversations");
    } finally {
      setConversationsLoading(false);
    }
  }, []);

  const fetchMessages = useCallback(async () => {
    if (!userId) {
      setMessages([]);
      return;
    }

    try {
      setMessagesLoading(true);
      const res = await getMessagesWithUser(userId);
      setMessages(res.data.messages || []);
    } catch {
      toast.error("Failed to load messages");
    } finally {
      setMessagesLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchConversations();
    }, 0);

    return () => clearTimeout(timer);
  }, [fetchConversations]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchMessages();
    }, 0);

    return () => clearTimeout(timer);
  }, [fetchMessages]);

  useEffect(() => {
    if (!search.trim()) return undefined;

    const timer = setTimeout(async () => {
      try {
        const res = await getAllUsers(search);
        setSearchUsers(res.data.users || []);
      } catch {
        setSearchUsers([]);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [search]);

  const displayedSearchUsers = search.trim() ? searchUsers : [];

  useEffect(() => {
    if (!user?._id) return undefined;

    return subscribeToMessages((incomingMessage) => {
      const incomingSenderId = incomingMessage?.sender?._id;
      const incomingReceiverId = incomingMessage?.receiver?._id;
      const isForCurrentUser = incomingReceiverId === user._id;

      if (!isForCurrentUser) return;

      if (incomingSenderId === userId) {
        setMessages((prev) => [...prev, incomingMessage]);
      }

      void fetchConversations();
    });
  }, [fetchConversations, subscribeToMessages, user?._id, userId]);

  const handleSendMessage = async (event) => {
    event.preventDefault();

    if (!userId || !messageText.trim()) return;

    try {
      setSending(true);
      const res = await sendDirectMessage(userId, messageText.trim());
      setMessages((prev) => [...prev, res.data.data]);
      setMessageText("");
      void fetchConversations();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const isChatOpenOnMobile = Boolean(userId);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto grid min-h-screen max-w-[975px] border-x border-neutral-800 bg-black md:grid-cols-[320px_1fr]">
        <aside
          className={`border-r border-neutral-800 ${
            isChatOpenOnMobile ? "hidden md:block" : "block"
          }`}
        >
          <div className="sticky top-0 z-30 border-b border-neutral-800 bg-black/90 px-4 py-3 backdrop-blur-xl">
            <h1 className="text-xl font-bold">Messages</h1>
            <p className="mt-0.5 text-xs text-neutral-400">@{user?.username}</p>

            <div className="relative mt-3">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search users"
                className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 pl-9 text-sm text-white outline-none placeholder:text-neutral-500 focus:border-neutral-600"
              />
            </div>
          </div>

          {search.trim() ? (
            <div>
              {displayedSearchUsers.map((person) => (
                <button
                  key={person._id}
                  onClick={() => {
                    navigate(`/messages/${person._id}`);
                    setSearch("");
                    setSearchUsers([]);
                  }}
                  className="flex w-full items-center gap-3 border-b border-neutral-800 px-4 py-3 text-left transition hover:bg-neutral-950"
                >
                  <Avatar user={person} size={42} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">
                      {person.username}
                    </p>
                    <p className="truncate text-xs text-neutral-400">
                      {person.name}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          ) : conversationsLoading ? (
            <div className="flex min-h-[260px] items-center justify-center text-neutral-400">
              <Loader2 className="animate-spin" size={20} />
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex min-h-[260px] flex-col items-center justify-center px-6 text-center">
              <MessageCircle size={32} className="text-neutral-500" />
              <p className="mt-3 text-sm text-neutral-400">
                No conversations yet.
              </p>
            </div>
          ) : (
            <div>
              {conversations.map((conversation) => {
                const isActive = conversation.otherUser?._id === userId;
                return (
                  <Link
                    key={conversation._id}
                    to={`/messages/${conversation.otherUser?._id}`}
                    className={`flex items-center gap-3 border-b border-neutral-800 px-4 py-3 transition ${
                      isActive ? "bg-neutral-900" : "hover:bg-neutral-950"
                    }`}
                  >
                    <Avatar user={conversation.otherUser} size={44} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-white">
                        {conversation.otherUser?.username}
                      </p>
                      <p className="truncate text-xs text-neutral-400">
                        {conversation.lastMessage || "Start chatting"}
                      </p>
                    </div>
                    {conversation.unreadCount > 0 && (
                      <span className="rounded-full bg-red-500 px-2 py-0.5 text-[11px] font-bold text-white">
                        {conversation.unreadCount > 9
                          ? "9+"
                          : conversation.unreadCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </aside>

        <section className={isChatOpenOnMobile ? "block" : "hidden md:block"}>
          {!userId ? (
            <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
              <MessageCircle size={44} className="text-neutral-500" />
              <h2 className="mt-3 text-xl font-bold">Your Messages</h2>
              <p className="mt-2 text-sm text-neutral-400">
                Select a conversation to start chatting.
              </p>
            </div>
          ) : (
            <div className="flex min-h-screen flex-col">
              <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-neutral-800 bg-black/90 px-4 backdrop-blur-xl">
                <button
                  type="button"
                  onClick={() => navigate("/messages")}
                  className="md:hidden"
                >
                  <ArrowLeft size={22} />
                </button>
                <Avatar user={activeUser} size={40} />
                <div>
                  <p className="text-sm font-semibold text-white">
                    {activeUser?.username || "Chat"}
                  </p>
                  <p className="text-xs text-neutral-400">{activeUser?.name}</p>
                </div>
              </header>

              <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
                {messagesLoading ? (
                  <div className="flex h-full items-center justify-center text-neutral-400">
                    <Loader2 className="animate-spin" size={20} />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-neutral-500">
                    Start the conversation.
                  </div>
                ) : (
                  messages.map((message) => {
                    const isMine = message.sender?._id === user?._id;
                    return (
                      <div
                        key={message._id}
                        className={`flex ${
                          isMine ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[78%] rounded-2xl px-3 py-2 text-sm ${
                            isMine
                              ? "bg-[#0095f6] text-white"
                              : "bg-neutral-900 text-neutral-100"
                          }`}
                        >
                          {message.text}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <form
                onSubmit={handleSendMessage}
                className="border-t border-neutral-800 px-4 py-3"
              >
                <div className="flex items-center gap-2 rounded-full border border-neutral-700 bg-neutral-950 px-3 py-2">
                  <input
                    value={messageText}
                    onChange={(event) => setMessageText(event.target.value)}
                    placeholder="Message..."
                    className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-neutral-500"
                  />
                  <button
                    disabled={sending || !messageText.trim()}
                    className="rounded-full p-1 text-[#0095f6] transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                    title="Send message"
                  >
                    {sending ? (
                      <Loader2 size={17} className="animate-spin" />
                    ) : (
                      <SendHorizontal size={17} />
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default Messages;
