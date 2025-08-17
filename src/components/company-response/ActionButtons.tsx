import { Send, Trash2 } from 'lucide-react';
import type React from 'react';

interface ActionButtonsProps {
  isUpdating: boolean;
  submitting: boolean;
  deleting: boolean;
  onSubmit: () => void;
  onDelete: () => void;
  onClose: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  isUpdating,
  submitting,
  deleting,
  onSubmit,
  onDelete,
  onClose,
}) => {
  return (
    <div className="flex justify-between items-center pt-6 border-t border-slate-200 dark:border-slate-700">
      {/* Left side - Delete button (only when updating) */}
      <div>
        {isUpdating && (
          <button
            onClick={onDelete}
            disabled={deleting}
            className="inline-flex items-center px-4 py-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all font-semibold border border-red-300 dark:border-red-600 hover:border-red-400 dark:hover:border-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {deleting ? (
              <>
                <div className="w-4 h-4 mr-2 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                Suppression...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Supprimer
              </>
            )}
          </button>
        )}
      </div>

      {/* Right side - Cancel and Submit buttons */}
      <div className="flex space-x-4">
        <button
          onClick={onClose}
          className="inline-flex items-center px-6 py-3 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all font-semibold border border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500"
        >
          Annuler
        </button>
        <button
          onClick={onSubmit}
          disabled={submitting}
          className="inline-flex items-center px-6 py-3 text-white rounded-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
          style={{ backgroundColor: 'var(--primary-color)' }}
        >
          {submitting ? (
            <>
              <div className="w-5 h-5 mr-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              {isUpdating ? 'Mise à jour en cours...' : 'Envoi en cours...'}
            </>
          ) : (
            <>
              <Send className="w-5 h-5 mr-3" />
              {isUpdating ? 'Mettre à jour la réponse' : 'Envoyer la réponse'}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ActionButtons;
