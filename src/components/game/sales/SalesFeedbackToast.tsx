import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, Lightbulb } from "lucide-react";

interface SalesFeedbackToastProps {
  feedback: { text: string; isOptimal: boolean } | null;
}

export function SalesFeedbackToast({ feedback }: SalesFeedbackToastProps) {
  return (
    <AnimatePresence>
      {feedback && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          className={`
            fixed bottom-24 left-1/2 -translate-x-1/2 max-w-md w-full mx-4
            px-4 py-3 rounded-xl shadow-xl z-50
            ${feedback.isOptimal 
              ? 'bg-green-500/90 text-white' 
              : 'bg-amber-500/90 text-white'
            }
          `}
        >
          <div className="flex items-start gap-3">
            {feedback.isOptimal ? (
              <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            ) : (
              <Lightbulb className="w-5 h-5 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-medium text-sm">
                {feedback.isOptimal ? 'Excelente resposta!' : 'Dica para melhorar'}
              </p>
              <p className="text-sm opacity-90 mt-0.5">{feedback.text}</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
