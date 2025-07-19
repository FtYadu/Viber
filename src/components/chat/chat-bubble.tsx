"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatWindow } from "./chat-window";
import { usePathname } from "next/navigation";

export function ChatBubble() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  // Don't show chat bubble on admin pages
  const isAdminPage = pathname?.startsWith("/admin");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close chat when navigating to a new page
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  if (!mounted || isAdminPage) {
    return null;
  }

  return (
    <>
      <div className="fixed bottom-4 right-4 z-50">
        <AnimatePresence>
          {isOpen ? (
            <motion.div
              key="chat-window"
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{ duration: 0.2 }}
              className="mb-4"
            >
              <ChatWindow onClose={() => setIsOpen(false)} />
            </motion.div>
          ) : null}
        </AnimatePresence>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1, type: "spring", stiffness: 260, damping: 20 }}
        >
          <Button
            onClick={() => setIsOpen(!isOpen)}
            size="lg"
            className={`rounded-full shadow-lg ${
              isOpen ? "bg-gray-700 hover:bg-gray-800" : "bg-primary hover:bg-primary/90"
            } h-14 w-14 p-0`}
            aria-label={isOpen ? "Close chat" : "Open chat"}
          >
            {isOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <MessageCircle className="h-6 w-6" />
            )}
          </Button>
        </motion.div>
      </div>
    </>
  );
}