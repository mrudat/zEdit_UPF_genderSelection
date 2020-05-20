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

registerPatcher({
  info: info,
  gameModes: [xelib.gmFO4],
  settings: {
    label: info.name,
    templateUrl: `${patcherUrl}/partials/settings.html`,
    controller: function ($scope) {
      const patcherSettings = $scope.settings.genderSelection

      $scope.femaleLists = patcherSettings.femaleLists.sort()
      $scope.maleLists = patcherSettings.maleLists.sort()

      $scope.min = Math.min

      $scope.removeFemale = (index) => {
        $scope.femaleLists.splice(index, 1)
      }

      $scope.addFemale = () => {
        $scope.femaleLists.push('SomeListToHaveMalesRemoved')
      }

      $scope.removeMale = (index) => {
        $scope.maleLists.splice(index, 1)
      }

      $scope.addMale = () => {
        $scope.maleLists.push('SomeListToHaveFemalesRemoved')
      }
    },
    defaultSettings: {
      patchFileName: 'zPatch.esp',
      femaleLists: [
        'DLC03LCharWorkshopNPC',
        'DLC06LCharWorkshopNPC',
        'JtB_SSAO_SimTowers_Room1Guests',
        'JtB_SSAO_SimTowers_Room2Guests',
        'JtB_SSAO_SimTowers_Room3Guests',
        'JtB_SSAO_SimTowers_Room4Guests',
        'JtB_SSAO_SimTowers_Room5Guests',
        'kgSIM_Civilians_Commonwealth',
        'kgSIM_Civilians_FarHarbor',
        'kgSIM_DefaultGenericVisitorForms',
        'kgSIM_LChar_IndRev_IronMineWorkerNPC',
        'kgSIM_LCharEnslavedSettler',
        'LCharMinutemenFaces',
        'LCharRRAgentFace',
        'LCharWorkshopGuard',
        'LCharWorkshopNPC_EvenToned',
        'LCharWorkshopNPC_NoBoston',
        'LCharWorkshopNPC',
        'simvault_Minutefans'
      ],
      maleLists: [
        'LCharScavenger',
        'DLC03_LCharTrapperFace',
        'DLC04_LCharRaiderDiscipleFace',
        'DLC04_LCharRaiderOperatorFace',
        'DLC04_LCharRaiderPackFace',
        'DLC04LCharWorkshopRaiderA',
        'DLC04LCharWorkshopRaiderASpokesperson',
        'DLC04LCharWorkshopRaiderB',
        'DLC04LCharWorkshopRaiderBSpokesperson',
        'DLC04LCharWorkshopRaiderC',
        'DLC04LCharWorkshopRaiderCSpokesperson',
        'LCharBoSTraitsSoldier',
        'LCharChildrenofAtomFaces',
        'LCharGunnerFaceAndGender',
        'LCharRaiderFaceAndGender',
        'LCharRaiderGhoulFaceAndGender',
        'LCharTriggermanFaceAndRace',
        'LCharTriggermanGhoulFaces',
        'LCharTriggermanHumanFaces',
        'tkz_LCharBOSFaceAndGender'
      ]
    }
  },
  execute: (patchFile, helpers, settings, locals) => ({
    initialize: function (patchFile, helpers, settings, locals) {
      locals.femaleLists = new Set(settings.femaleLists)
      locals.maleLists = new Set(settings.maleLists)
    },
    process: [
      {
        load: {
          signature: 'LVLN',
          filter: function (lvln) {
            if (!HasElement(lvln, 'Leveled List Entries')) return false
            const edid = EditorID(lvln)
            if (locals.femaleLists.has(edid)) return true
            if (locals.maleLists.has(edid)) return true
            return false
          }
        },
        patch: function (lvln, helpers, settings, locals) {
          const { logMessage } = helpers
          const removeFemales = locals.maleLists.has(EditorID(lvln))
          const victims = removeFemales ? 'females' : 'males'
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
                    if (GetIsFemale(npc) === removeFemales) {
                      toRemove.add(llentry)
                    }
                  })
                })
              })
            }

            if (toRemove.size === 0) {
              logMessage(`No ${victims} found, nothing to do.`)
              return
            }

            if (toRemove.size === npcCount) {
              // Probably not safe to add an NPC of the opposite gender to a single-gender LVLN, so we can't really do anything.
              logMessage(`[WARN] Would have removed all entries from ${LongName(lvln)}, not doing anything.`)
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
            if (locals.femaleLists.has(edid)) return true
            if (locals.maleLists.has(edid)) return true
            return false
          }
        },
        patch: function (flst, helpers, settings, locals) {
          const { logMessage } = helpers
          const removeFemales = locals.maleLists.has(EditorID(flst))
          const victims = removeFemales ? 'females' : 'males'
          logMessage(`Removing ${victims} from ${LongName(flst)}`)
          WithHandles(GetElements(flst, 'FormIDs'), (entries) => {
            const toRemove = new Set()
            let npcCount = 0
            for (const entry of entries) {
              WithHandle(GetLinksTo(entry), (npc) => {
                WithHandle(GetWinningOverride(npc), (npc) => {
                  if (Signature(npc) !== 'NPC_') return
                  npcCount = npcCount + 1
                  if (GetIsFemale(npc) === removeFemales) {
                    toRemove.add(entry)
                  }
                })
              })
            }

            if (toRemove.size === 0) {
              logMessage(`No ${victims} found, nothing to do.`)
              return
            }

            if (toRemove.size === npcCount) {
              // Probably not safe to add an NPC of the opposite gender to a single-gender LVLN, so we can't really do anything.
              logMessage(`[WARN] Would have removed all entries from ${LongName(flst)}, not doing anything.`)
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
