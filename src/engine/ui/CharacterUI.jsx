// src/game/ui/CharacterUI.jsx

import React, { useState } from 'react'

const CharacterUI = ({
  character,
  onSkillUpgrade,
  onClose
}) => {
  const [selectedTab, setSelectedTab] = useState('stats')

  const renderStatBar = (current, max, color) => (
    <div className="w-full h-4 bg-gray-800 rounded overflow-hidden">
      <div
        className={`h-full ${color}`}
        style={{ width: `${(current / max) * 100}%` }}
      />
    </div>
  )

  const renderSkillProgress = (current, max) => (
    <div className="w-full h-2 bg-gray-800 rounded overflow-hidden">
      <div
        className="h-full bg-blue-500"
        style={{ width: `${(current / max) * 100}%` }}
      />
    </div>
  )

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-gray-900 p-6 rounded-lg w-full max-w-4xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">Character Sheet</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Tab buttons */}
        <div className="flex gap-4 mb-4">
          <button
            className={`px-4 py-2 rounded ${selectedTab === 'stats'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300'
              }`}
            onClick={() => setSelectedTab('stats')}
          >
            Stats
          </button>
          <button
            className={`px-4 py-2 rounded ${selectedTab === 'skills'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300'
              }`}
            onClick={() => setSelectedTab('skills')}
          >
            Skills
          </button>
        </div>

        <div className="flex gap-6">
          {/* Basic Info */}
          <div className="w-64">
            <div className="bg-gray-800 p-4 rounded mb-4">
              <div className="text-xl font-bold text-white mb-2">
                {character.name}
              </div>
              <div className="text-gray-400 mb-4">
                Level {character.level}
              </div>

              {/* Experience Bar */}
              <div className="mb-2">
                <div className="text-sm text-gray-400 mb-1">Experience</div>
                {renderStatBar(character.experience, character.experienceToNext, 'bg-purple-600')}
                <div className="text-xs text-gray-500 mt-1">
                  {character.experience} / {character.experienceToNext}
                </div>
              </div>

              {/* Health Bar */}
              <div className="mb-2">
                <div className="text-sm text-gray-400 mb-1">Health</div>
                {renderStatBar(character.currentHP, character.maxHP, 'bg-red-600')}
                <div className="text-xs text-gray-500 mt-1">
                  {character.currentHP} / {character.maxHP}
                </div>
              </div>

              {/* Mana Bar */}
              <div className="mb-2">
                <div className="text-sm text-gray-400 mb-1">Mana</div>
                {renderStatBar(character.currentMana, character.maxMana, 'bg-blue-600')}
                <div className="text-xs text-gray-500 mt-1">
                  {character.currentMana} / {character.maxMana}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            {selectedTab === 'stats' ? (
              <div className="bg-gray-800 p-4 rounded">
                <h3 className="text-lg font-bold text-white mb-4">Attributes</h3>

                {/* Base Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div>
                    <div className="text-gray-400 mb-1">Physicality</div>
                    <div className="text-xl text-white">
                      {character.stats.physicality}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400 mb-1">Mental</div>
                    <div className="text-xl text-white">
                      {character.stats.mental}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400 mb-1">Social</div>
                    <div className="text-xl text-white">
                      {character.stats.social}
                    </div>
                  </div>
                </div>

                {/* Derived Stats */}
                <h3 className="text-lg font-bold text-white mb-4">Combat Stats</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-gray-400 mb-1">Physical Attack</div>
                    <div className="text-white">
                      Base: {character.combat.physicalAttack}
                      {character.combat.physicalAttackBonus > 0 && (
                        <span className="text-green-400">
                          {" +"}
                          {character.combat.physicalAttackBonus}
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400 mb-1">Physical Defense</div>
                    <div className="text-white">
                      Base: {character.combat.physicalDefense}
                      {character.combat.physicalDefenseBonus > 0 && (
                        <span className="text-green-400">
                          {" +"}
                          {character.combat.physicalDefenseBonus}
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400 mb-1">Magic Attack</div>
                    <div className="text-white">
                      Base: {character.combat.magicAttack}
                      {character.combat.magicAttackBonus > 0 && (
                        <span className="text-green-400">
                          {" +"}
                          {character.combat.magicAttackBonus}
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400 mb-1">Magic Defense</div>
                    <div className="text-white">
                      Base: {character.combat.magicDefense}
                      {character.combat.magicDefenseBonus > 0 && (
                        <span className="text-green-400">
                          {" +"}
                          {character.combat.magicDefenseBonus}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-800 p-4 rounded">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-white">Skills</h3>
                  <div className="text-yellow-400">
                    Skill Points: {character.skillPoints}
                  </div>
                </div>

                {/* Skill Categories */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Combat Skills */}
                  <div>
                    <h4 className="text-white font-bold mb-2">Combat</h4>
                    {character.skills.combat.map(skill => (
                      <div
                        key={skill.id}
                        className="mb-2 p-2 bg-gray-700 rounded"
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-white">
                            {skill.name}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400">
                              {skill.level}
                            </span>
                            {character.skillPoints > 0 && skill.level < skill.maxLevel && (
                              <button
                                className="px-2 py-1 bg-blue-600 rounded text-sm"
                                onClick={() => onSkillUpgrade(skill.id)}
                              >
                                +
                              </button>
                            )}
                          </div>
                        </div>
                        {renderSkillProgress(skill.level, skill.maxLevel)}
                      </div>
                    ))}
                  </div>

                  {/* Magic Skills */}
                  <div>
                    <h4 className="text-white font-bold mb-2">Magic</h4>
                    {character.skills.magic.map(skill => (
                      <div
                        key={skill.id}
                        className="mb-2 p-2 bg-gray-700 rounded"
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-white">
                            {skill.name}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400">
                              {skill.level}
                            </span>
                            {character.skillPoints > 0 && skill.level < skill.maxLevel && (
                              <button
                                className="px-2 py-1 bg-blue-600 rounded text-sm"
                                onClick={() => onSkillUpgrade(skill.id)}
                              >
                                +
                              </button>
                            )}
                          </div>
                        </div>
                        {renderSkillProgress(skill.level, skill.maxLevel)}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CharacterUI
