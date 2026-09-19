function SettingsActions({ dirty, isSaving, saveError, saved, onSave, onReset }) {
  return (
    <>
      {saveError ? (
        <div className="alert alert--error" role="alert">
          {saveError}
        </div>
      ) : null}

      {saved ? (
        <div className="alert alert--success" role="status">
          Settings saved.
        </div>
      ) : null}

      <div className="settings-actions">
        <button
          type="button"
          className="btn btn--primary"
          onClick={onSave}
          disabled={!dirty || isSaving}
        >
          {isSaving ? (
            <>
              <span className="spinner" aria-hidden="true" />
              Saving&hellip;
            </>
          ) : (
            'Save Changes'
          )}
        </button>
        <button
          type="button"
          className="btn"
          onClick={onReset}
          disabled={!dirty || isSaving}
        >
          Reset Changes
        </button>
      </div>
    </>
  )
}

export default SettingsActions