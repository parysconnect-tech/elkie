import { MessageCircle } from 'lucide-react'

const NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER as string | undefined

export function WhatsAppButton() {
  if (!NUMBER) return null
  return (
    <a
      href={`https://wa.me/${NUMBER}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl transition-transform hover:scale-110"
    >
      <MessageCircle size={26} />
    </a>
  )
}
