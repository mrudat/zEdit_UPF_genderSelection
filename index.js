/* global xelib, registerPatcher, patcherUrl, info */

const {
  EditorID,
  GetElement,
  GetElements,
  GetIsFemale,
  GetLinksTo,
  GetWinningOverride,
  HasElement,
  LongName,
  RemoveElement,
  Signature,
  WithHandle,
  WithHandles
} = xelib

function sortObjectByKey (object) {
  Object.keys(object).sort().forEach((key) => {
    const temp = object[key]
    delete object[key]
    object[key] = temp
  })
}

const GHOUL_RACE = 'GhoulRace "Ghoul" [RACE:000EAFB6]'

function isGhoul (npc) {
  return WithHandle(GetLinksTo(npc, 'RNAM'), (rnam) => LongName(rnam) === GHOUL_RACE)
}

const REMOVE_MALES = 1
const REMOVE_FEMALES = 2

registerPatcher({
  info: info,
  gameModes: [xelib.gmFO4],
  settings: {
    label: info.name,
    templateUrl: `${patcherUrl}/partials/settings.html`,
    controller: function ($scope) {
      const patcherSettings = $scope.settings.genderSelection
      let counter = 0

      const lists = $scope.lists = patcherSettings.lists
      sortObjectByKey(lists)

      $scope.min = Math.min

      $scope.removeEntry = (listName) => {
        delete lists[listName]
      }

      $scope.addEntry = () => {
        $scope.lists[`#AListToHaveNPCsRemoved${counter}`] = {}
        sortObjectByKey($scope.lists)
        counter++
      }
    },
    defaultSettings: {
      patchFileName: 'zPatch.esp',
      lists: {
        DLC03LCharWorkshopNPC: {
          removeGhouls: true,
          genderAction: 1
        },
        DLC03_LCharTrapperFace: {
          genderAction: 2
        },
        DLC04LCharWorkshopRaiderA: {
          genderAction: 2
        },
        DLC04LCharWorkshopRaiderASpokesperson: {
          genderAction: 2
        },
        DLC04LCharWorkshopRaiderB: {
          genderAction: 2
        },
        DLC04LCharWorkshopRaiderBSpokesperson: {
          genderAction: 2
        },
        DLC04LCharWorkshopRaiderC: {
          genderAction: 2
        },
        DLC04LCharWorkshopRaiderCSpokesperson: {
          genderAction: 2
        },
        DLC04_LCharRaiderDiscipleFace: {
          genderAction: 2
        },
        DLC04_LCharRaiderOperatorFace: {
          genderAction: 2
        },
        DLC04_LCharRaiderPackFace: {
          genderAction: 2
        },
        DLC06LCharWorkshopNPC: {
          removeGhouls: true,
          genderAction: 1
        },
        JtB_SSAO_SimTowers_Room1Guests: {
          genderAction: 1
        },
        JtB_SSAO_SimTowers_Room2Guests: {
          genderAction: 1
        },
        JtB_SSAO_SimTowers_Room3Guests: {
          genderAction: 1
        },
        JtB_SSAO_SimTowers_Room4Guests: {
          genderAction: 1
        },
        JtB_SSAO_SimTowers_Room5Guests: {
          genderAction: 1
        },
        LCharBoSTraitsSoldier: {
          genderAction: 2
        },
        LCharChildrenofAtomFaces: {
          genderAction: 2
        },
        LCharGunnerFaceAndGender: {
          genderAction: 2
        },
        LCharMinutemenFaces: {
          removeGhouls: true,
          genderAction: 1
        },
        LCharRRAgentFace: {
          removeGhouls: true,
          genderAction: 1
        },
        LCharRaiderFaceAndGender: {
          genderAction: 2
        },
        LCharRaiderGhoulFaceAndGender: {
          genderAction: 2
        },
        LCharScavenger: {
          genderAction: 2
        },
        LCharTriggermanFaceAndRace: {
          genderAction: 2
        },
        LCharTriggermanGhoulFaces: {
          genderAction: 2
        },
        LCharTriggermanHumanFaces: {
          genderAction: 2
        },
        LCharWorkshopGuard: {
          removeGhouls: true,
          genderAction: 1
        },
        LCharWorkshopNPC: {
          removeGhouls: true,
          genderAction: 1
        },
        LCharWorkshopNPC_EvenToned: {
          removeGhouls: true,
          genderAction: 1
        },
        LCharWorkshopNPC_NoBoston: {
          removeGhouls: true,
          genderAction: 1
        },
        aListToHaveNPCsRemoved0: {},
        kgSIM_Civilians_Commonwealth: {
          removeGhouls: true,
          genderAction: 1
        },
        kgSIM_Civilians_FarHarbor: {
          removeGhouls: true,
          genderAction: 1
        },
        kgSIM_DefaultGenericVisitorForms: {
          removeGhouls: true,
          genderAction: 1
        },
        kgSIM_LCharEnslavedSettler: {
          removeGhouls: true,
          genderAction: 1
        },
        kgSIM_LChar_IndRev_IronMineWorkerNPC: {
          removeGhouls: true,
          genderAction: 1
        },
        simvault_Minutefans: {
          genderAction: 1
        },
        tkz_LCharBOSFaceAndGender: {
          genderAction: 2
        }
      }
    }
  },
  execute: (patchFile, helpers, settings, locals) => ({
    initialize: function (patchFile, helpers, settings, locals) {
      const lists = locals.lists = new Map()
      const settingsLists = settings.lists
      for (const listName in settingsLists) {
        lists.set(listName, settingsLists[listName])
      }
    },
    process: [
      {
        load: {
          signature: 'LVLN',
          filter: function (lvln) {
            if (!HasElement(lvln, 'Leveled List Entries')) return false
            const edid = EditorID(lvln)
            if (locals.lists.has(edid)) return true
            return false
          }
        },
        patch: function (lvln, helpers, settings, locals) {
          const { logMessage } = helpers
          const { genderAction, removeGhouls } = locals.lists.get(EditorID(lvln))
          const removeFemales = genderAction == REMOVE_FEMALES
          const removeMales = genderAction == REMOVE_MALES
          let victims = []
          if (removeFemales) victims.push('females')
          if (removeMales) victims.push('males')
          if (removeGhouls) victims.push('ghouls')
          victims = victims.join(' and ')
          logMessage(`Removing ${victims} from ${LongName(lvln)}`)
          WithHandles(GetElements(lvln, 'Leveled List Entries'), (llentries) => {
            const toRemove = new Set()
            let npcCount = 0
            for (const llentry of llentries) {
              WithHandle(GetElement(llentry, 'LVLO\\Reference'), (ref) => {
                WithHandle(GetLinksTo(ref), (npc) => {
                  WithHandle(GetWinningOverride(npc), (npc) => {
                    if (Signature(npc) !== 'NPC_') return
                    npcCount = npcCount + 1
                    if (removeFemales || removeMales) {
                      const isFemale = GetIsFemale(npc)
                      if (isFemale && removeFemales) return toRemove.add(llentry)
                      if (!isFemale && removeMales) return toRemove.add(llentry)
                    }
                    if (removeGhouls && isGhoul(npc)) return toRemove.add(llentry)
                  })
                })
              })
            }

            if (toRemove.size === 0) {
              logMessage(`No ${victims} found, nothing to do.`)
              return
            }

            if (toRemove.size === npcCount) {
              logMessage(`[WARN] Would have removed all entries from ${LongName(lvln)}, not doing anything.`)
              WithHandles(toRemove.values())
              return
            }

            for (const llentry of toRemove) {
              RemoveElement(llentry)
            }
          })
        }
      },
      {
        load: {
          signature: 'FLST',
          filter: function (flst) {
            if (!HasElement(flst, 'FormIDs')) return false
            const edid = EditorID(flst)
            if (locals.lists.has(edid)) return true
            return false
          }
        },
        patch: function (flst, helpers, settings, locals) {
          const { logMessage } = helpers
          const { genderAction, removeGhouls } = locals.lists.get(EditorID(flst))
          const removeFemales = genderAction == REMOVE_FEMALES
          const removeMales = genderAction == REMOVE_MALES
          let victims = []
          if (removeFemales) victims.push('females')
          if (removeMales) victims.push('males')
          if (removeGhouls) victims.push('ghouls')
          victims = victims.join(' and ')
          logMessage(`Removing ${victims} from ${LongName(flst)}`)
          WithHandles(GetElements(flst, 'FormIDs'), (entries) => {
            const toRemove = new Set()
            let npcCount = 0
            for (const entry of entries) {
              WithHandle(GetLinksTo(entry), (npc) => {
                WithHandle(GetWinningOverride(npc), (npc) => {
                  if (Signature(npc) !== 'NPC_') return
                  npcCount = npcCount + 1
                  if (removeFemales || removeMales) {
                    const isFemale = GetIsFemale(npc)
                    if (isFemale && removeFemales) return toRemove.add(entry)
                    if (!isFemale && removeMales) return toRemove.add(entry)
                  }
                  if (removeGhouls && isGhoul(npc)) return toRemove.add(entry)
                })
              })
            }

            if (toRemove.size === 0) {
              logMessage(`No ${victims} found, nothing to do.`)
              return
            }

            if (toRemove.size === npcCount) {
              logMessage(`[WARN] Would have removed all entries from ${LongName(flst)}, not doing anything.`)
              WithHandles(toRemove.values())
              return
            }

            for (const entry of toRemove) {
              RemoveElement(entry)
            }
          })
        }
      }
    ]
  })
})
