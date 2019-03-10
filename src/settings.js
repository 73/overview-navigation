const PROPERTIES = {
  SHOW_OVERVIEW_WHEN_CHANGE_WORKSPACE_KEY:
    'show-overview-when-change-workspace',
  SHOW_WINDOW_SELECTOR_WHEN_SHOW_OVERVIEW:
    'show-window-selector-when-show-overview',
  DEBUG: 'debug'
}

class Settings {
  constructor (gioSettings, gioFlag) {
    this.gioFlag = gioFlag
    this.gioSettings = gioSettings
    this.showOverviewOnSwitchWorkspace = true
  }

  isShowOverviewOnSwitchWorkspace () {
    return this.gioSettings.get_boolean(
      PROPERTIES.SHOW_OVERVIEW_WHEN_CHANGE_WORKSPACE_KEY
    )
  }

  isShowWindowSelectorWhenShowOverview () {
    return this.gioSettings.get_boolean(
      PROPERTIES.SHOW_WINDOW_SELECTOR_WHEN_SHOW_OVERVIEW
    )
  }

  isDebug () {
    return this.gioSettings.get_boolean(PROPERTIES.DEBUG)
  }

  bind (key, object, property) {
    this.gioSettings.bind(key, object, property, this.gioFlag)
  }
}

if (!global.overviewNavigationTesting) {
  /* global imports */
  const ExtensionUtils = imports.misc.extensionUtils
  const OverviewNavigation = ExtensionUtils.getCurrentExtension()
  const Gio = imports.gi.Gio
  const GioSS = Gio.SettingsSchemaSource

  class GioSettingsLoader {
    constructor () {
      this.schema = OverviewNavigation.metadata['settings-schema']
      this.schemaDir = OverviewNavigation.dir.get_child('schemas')
    }

    load () {
      const schemaSource = this._createSchemaSource()
      const schemaObj = schemaSource.lookup(this.schema, true)

      if (!schemaObj) {
        throw new Error(
          `Schema ${this.schema} could not be found for extension ${
            OverviewNavigation.metadata.uuid
          }`
        )
      }

      return new Gio.Settings({ settings_schema: schemaObj })
    }

    _createSchemaSource () {
      if (!this.schemaDir.query_exists(null)) {
        return GioSS.get_default()
      }

      return GioSS.new_from_directory(
        this.schemaDir.get_path(),
        GioSS.get_default(),
        false
      )
    }
  }

  /*eslint-disable */
  function initialize() {
    /* eslint-enable */
    const gioSettingsLoader = new GioSettingsLoader()
    return new Settings(gioSettingsLoader.load(), Gio.SettingsBindFlags.DEFAULT)
  }
} else {
  module.exports = { Settings }
}