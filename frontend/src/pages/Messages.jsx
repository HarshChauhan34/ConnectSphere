import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Info,
  Loader2,
  MessageCircle,
  PenSquare,
  Search,
  SendHorizontal,
  Smile,
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
  const [chatUser, setChatUser] = useState(null);

  const messagesEndRef = useRef(null);

  const activeConversation = useMemo(
    () =>
      conversations.find(
        (conversation) => conversation.otherUser?._id === userId
      ) || null,
    [conversations, userId]
  );

  const activeUser = chatUser || activeConversation?.otherUser || null;

  const fetchConversations = useCallback(async () => {
    try {
      setConversationsLoading(true);
      const res = await getConversations();
      setConversations(res.data.conversations || []);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to load conversations"
      );
    } finally {
      setConversationsLoading(false);
    }
  }, []);

  const fetchMessages = useCallback(async () => {
    if (!userId) {
      setMessages([]);
      setChatUser(null);
      return;
    }

    try {
      setMessagesLoading(true);
      const res = await getMessagesWithUser(userId);
      setMessages(res.data.messages || []);
      setChatUser(res.data.otherUser || null);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load messages");
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

    let isCancelled = false;

    const timer = setTimeout(async () => {
      try {
        const res = await getAllUsers(search);
        if (!isCancelled) {
          setSearchUsers(res.data.users || []);
        }
      } catch {
        if (!isCancelled) setSearchUsers([]);
      }
    }, 350);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [search]);

  useEffect(() => {
    if (!user?._id) return;

    return subscribeToMessages((incomingMessage) => {
      const incomingSenderId = incomingMessage?.sender?._id;
      const incomingReceiverId = incomingMessage?.receiver?._id;

      if (incomingReceiverId !== user._id) return;

      if (incomingSenderId === userId) {
        setMessages((prev) => [...prev, incomingMessage]);
      }

      fetchConversations();
    });
  }, [fetchConversations, subscribeToMessages, user?._id, userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, userId]);

  const handleSendMessage = async (event) => {
    event.preventDefault();

    if (!userId || !messageText.trim()) return;

    try {
      setSending(true);
      const res = await sendDirectMessage(userId, messageText.trim());
      setMessages((prev) => [...prev, res.data.data]);
      setMessageText("");
      fetchConversations();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const isChatOpenOnMobile = Boolean(userId);
  const showSearchResults = search.trim().length > 0;

  return (
    <div className="h-full min-h-0 overflow-hidden bg-[#000] text-white">
      <div className="mx-auto grid h-full max-w-[980px] overflow-hidden border-x border-neutral-800 bg-black md:grid-cols-[360px_1fr]">
        {/* Sidebar */}
        <aside
          className={`flex h-full min-h-0 flex-col border-r border-neutral-800 bg-black ${
            isChatOpenOnMobile ? "hidden md:flex" : "flex"
          }`}
        >
          <div className="shrink-0 border-b border-neutral-800 px-5 py-5">
            <div className="flex items-center justify-between">
              <h1 className="max-w-[220px] truncate text-xl font-bold">
                {user?.username || "Messages"}
              </h1>

              <button className="rounded-full p-2 transition hover:bg-neutral-900">
                <PenSquare size={22} />
              </button>
            </div>

            <h2 className="mt-6 text-2xl font-bold">Messages</h2>

            <div className="relative mt-4">
              <Search
                size={17}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
              />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search"
                className="w-full rounded-xl border border-transparent bg-[#262626] py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-neutral-400 focus:border-neutral-500"
              />
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {showSearchResults ? (
              searchUsers.length > 0 ? (
                searchUsers.map((person) => (
                  <button
                    key={person._id}
                    onClick={() => {
                      navigate(`/messages/${person._id}`);
                      setSearch("");
                      setSearchUsers([]);
                    }}
                    className="flex w-full items-center gap-4 px-5 py-3.5 text-left transition hover:bg-neutral-900/80"
                  >
                    <Avatar user={person} size={56} />

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {person.username}
                      </p>
                      <p className="truncate text-sm text-neutral-400">
                        {person.name}
                      </p>
                    </div>
                  </button>
                ))
              ) : (
                <div className="px-5 py-12 text-center text-sm text-neutral-400">
                  No users found.
                </div>
              )
            ) : conversationsLoading ? (
              <div className="flex h-full items-center justify-center text-neutral-400">
                <Loader2 className="animate-spin" size={24} />
              </div>
            ) : conversations.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                <div className="rounded-full border border-neutral-700 p-5">
                  <MessageCircle size={40} className="text-neutral-300" />
                </div>
                <p className="mt-4 font-semibold">No messages yet</p>
                <p className="mt-1 text-sm text-neutral-400">
                  Search users and start chatting.
                </p>
              </div>
            ) : (
              conversations.map((conversation) => {
                const isActive = conversation.otherUser?._id === userId;

                return (
                  <Link
                    key={conversation._id}
                    to={`/messages/${conversation.otherUser?._id}`}
                    className={`flex items-center gap-4 px-5 py-3.5 transition ${
                      isActive
                        ? "bg-neutral-900"
                        : "hover:bg-neutral-900/70"
                    }`}
                  >
                    <div className="relative">
                      <Avatar user={conversation.otherUser} size={58} />
                      {conversation.unreadCount > 0 && (
                        <span className="absolute -right-1 -top-1 h-4 w-4 rounded-full border-2 border-black bg-[#0095f6]" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">
                        {conversation.otherUser?.username}
                      </p>
                      <p className="truncate text-sm text-neutral-400">
                        {conversation.lastMessage || "Start chatting"}
                      </p>
                    </div>

                    {conversation.unreadCount > 0 && (
                      <span className="rounded-full bg-[#0095f6] px-2 py-0.5 text-xs font-bold">
                        {conversation.unreadCount > 9
                          ? "9+"
                          : conversation.unreadCount}
                      </span>
                    )}
                  </Link>
                );
              })
            )}
          </div>
        </aside>

        {/* Chat Area */}
        <section
          className={`h-full min-h-0 bg-black ${
            isChatOpenOnMobile ? "block" : "hidden md:block"
          }`}
        >
          {!userId ? (
            <div className="flex h-full flex-col items-center justify-center px-6 text-center">
              <div className="rounded-full border-2 border-neutral-600 p-6">
                <MessageCircle size={56} />
              </div>

              <h2 className="mt-5 text-2xl font-light">Your messages</h2>
              <p className="mt-2 text-sm text-neutral-400">
                Send private messages to your friends.
              </p>

              <button className="mt-5 rounded-lg bg-[#0095f6] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#1877f2]">
                Send message
              </button>
            </div>
          ) : (
            <div className="flex h-full min-h-0 flex-col overflow-hidden">
              {/* Chat Header */}
              <header className="flex h-[72px] shrink-0 items-center justify-between border-b border-neutral-800 px-4">
                <div className="flex min-w-0 items-center gap-3">
                  <button
                    onClick={() => navigate("/messages")}
                    className="rounded-full p-2 transition hover:bg-neutral-900 md:hidden"
                  >
                    <ArrowLeft size={22} />
                  </button>

                  <Avatar user={activeUser} size={42} />

                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">
                      {activeUser?.username || "Chat"}
                    </p>
                    <p className="truncate text-xs text-neutral-400">
                      {activeUser?.name || "Instagram user"}
                    </p>
                  </div>
                </div>

                <button className="rounded-full p-2 transition hover:bg-neutral-900">
                  <Info size={22} />
                </button>
              </header>

              {/* Messages */}
              <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6">
                {messagesLoading ? (
                  <div className="flex h-full items-center justify-center">
                    <Loader2 className="animate-spin text-neutral-400" size={24} />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-center">
                    <Avatar user={activeUser} size={88} />

                    <h3 className="mt-4 text-lg font-semibold">
                      {activeUser?.username}
                    </h3>

                    <p className="mt-1 text-sm text-neutral-400">
                      Start your conversation now.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {messages.map((message) => {
                      const isMine = message.sender?._id === user?._id;

                      return (
                        <div
                          key={message._id}
                          className={`flex items-end gap-2 ${
                            isMine ? "justify-end" : "justify-start"
                          }`}
                        >
                          {!isMine && <Avatar user={message.sender} size={26} />}

                          <div
                            className={`max-w-[75%] rounded-[24px] px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                              isMine
                                ? "rounded-br-md bg-[#3797f0] text-white"
                                : "rounded-bl-md bg-[#262626] text-white"
                            }`}
                          >
                            {message.text}
                          </div>
                        </div>
                      );
                    })}

                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Input */}
              <form
                onSubmit={handleSendMessage}
                className="shrink-0 border-t border-neutral-800 px-4 py-4"
              >
                <div className="flex items-center gap-3 rounded-full border border-neutral-700 px-4 py-2.5 transition focus-within:border-neutral-400">
                  <button type="button" className="text-neutral-300">
                    <Smile size={22} />
                  </button>

                  <input
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Message..."
                    className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-neutral-500"
                  />

                  <button
                    disabled={sending || !messageText.trim()}
                    className="font-semibold text-[#0095f6] transition disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {sending ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <SendHorizontal size={20} />
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
