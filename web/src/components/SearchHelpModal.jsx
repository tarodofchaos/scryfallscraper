import React from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

export default function SearchHelpModal({ isOpen, onClose }) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  const syntaxExamples = [
    {
      operator: 'o:',
      name: t('searchHelp.textInCard'),
      description: t('searchHelp.textInCardDesc'),
      examples: ['o:"draw a card"', 'o:"flying"']
    },
    {
      operator: 'set:',
      name: t('searchHelp.set'),
      description: t('searchHelp.setDesc'),
      examples: ['set:znr', 'set:m21']
    },
    {
      operator: 't:',
      name: t('searchHelp.type'),
      description: t('searchHelp.typeDesc'),
      examples: ['t:creature', 't:instant', 't:elf']
    },
    {
      operator: 'c:',
      name: t('searchHelp.color'),
      description: t('searchHelp.colorDesc'),
      examples: ['c:red', 'c:blue', 'c=wu']
    },
    {
      operator: 'id:',
      name: t('searchHelp.commanderIdentity'),
      description: t('searchHelp.commanderIdentityDesc'),
      examples: ['id:wu', 'id:rg']
    },
    {
      operator: 'cmc:',
      name: t('searchHelp.manaCost'),
      description: t('searchHelp.manaCostDesc'),
      examples: ['cmc:3', 'cmc:>5', 'cmc:<=2']
    },
    {
      operator: 'r:',
      name: t('searchHelp.rarity'),
      description: t('searchHelp.rarityDesc'),
      examples: ['r:mythic', 'r:rare']
    },
    {
      operator: 'lang:',
      name: t('searchHelp.language'),
      description: t('searchHelp.languageDesc'),
      examples: ['lang:en', 'lang:es']
    }
  ];

  const booleanExamples = [
    {
      description: t('searchHelp.andExample'),
      example: 't:creature c:red'
    },
    {
      description: t('searchHelp.orExample'),
      example: 'c:red OR c:blue'
    },
    {
      description: t('searchHelp.notExample'),
      example: 'NOT c:black'
    },
    {
      description: t('searchHelp.groupingExample'),
      example: '(c:red OR c:blue) t:instant'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-white/95 backdrop-blur-md rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-auto border border-white/20"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-gradient-to-r from-mtg-blue to-mtg-gold p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">
              {t('searchHelp.title')}
            </h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors text-2xl font-bold"
              aria-label={t('common.close')}
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <p className="text-mtg-black/80 mb-4">
              {t('searchHelp.intro')}
            </p>
          </div>

          {/* Search Operators */}
          <div>
            <h3 className="text-xl font-semibold text-mtg-black mb-4">
              {t('searchHelp.operators')}
            </h3>
            <div className="space-y-4">
              {syntaxExamples.map((item, index) => (
                <div key={index} className="bg-white/50 rounded-lg p-4 border border-white/20">
                  <div className="flex items-start gap-3">
                    <code className="text-lg font-mono font-bold text-mtg-blue bg-mtg-blue/10 px-3 py-1 rounded">
                      {item.operator}
                    </code>
                    <div className="flex-1">
                      <h4 className="font-semibold text-mtg-black mb-1">{item.name}</h4>
                      <p className="text-sm text-mtg-black/70 mb-2">{item.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {item.examples.map((ex, i) => (
                          <code key={i} className="text-sm bg-mtg-black/10 text-mtg-black px-2 py-1 rounded">
                            {ex}
                          </code>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Boolean Logic */}
          <div>
            <h3 className="text-xl font-semibold text-mtg-black mb-4">
              {t('searchHelp.booleanLogic')}
            </h3>
            <div className="space-y-3">
              {booleanExamples.map((item, index) => (
                <div key={index} className="bg-white/50 rounded-lg p-4 border border-white/20">
                  <p className="text-sm text-mtg-black/70 mb-2">{item.description}</p>
                  <code className="text-sm bg-mtg-black/10 text-mtg-black px-3 py-2 rounded block">
                    {item.example}
                  </code>
                </div>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div className="bg-mtg-blue/10 rounded-lg p-4 border border-mtg-blue/20">
            <h3 className="text-lg font-semibold text-mtg-black mb-2">
              {t('searchHelp.tips')}
            </h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-mtg-black/80">
              <li>{t('searchHelp.tip1')}</li>
              <li>{t('searchHelp.tip2')}</li>
              <li>{t('searchHelp.tip3')}</li>
            </ul>
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={onClose}
              className="btn-primary"
            >
              {t('common.close')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

SearchHelpModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
};

