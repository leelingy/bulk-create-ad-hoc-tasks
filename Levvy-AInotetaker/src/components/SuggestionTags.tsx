import "./SuggestionTags.css";

type TagProps = {
  label: string;
  value: string;
  onApply: () => void;
  onDismiss: () => void;
};

export function SuggestionTag({ label, value, onApply, onDismiss }: TagProps) {
  return (
    <span className="suggestion-tag">
      <span className="suggestion-tag-label">{label}</span>
      <span className="suggestion-tag-value">{value}</span>
      <button
        type="button"
        className="suggestion-tag-action apply"
        onClick={onApply}
        title="Apply suggestion"
      >
        Apply
      </button>
      <button
        type="button"
        className="suggestion-tag-action dismiss"
        onClick={onDismiss}
        title="Dismiss suggestion"
        aria-label="Dismiss suggestion"
      >
        ×
      </button>
    </span>
  );
}

type TaskNameSuggestionsProps = {
  suggestedName: string | null | undefined;
  genericName: string | null | undefined;
  dismissed: boolean;
  onApplySuggested: () => void;
  onDismissSuggested: () => void;
  onApplyGeneric: () => void;
};

export function TaskNameSuggestionTags({
  suggestedName,
  genericName,
  dismissed,
  onApplySuggested,
  onDismissSuggested,
  onApplyGeneric,
}: TaskNameSuggestionsProps) {
  if (dismissed && !genericName) return null;

  return (
    <div className="suggestion-tags">
      {!dismissed && suggestedName && (
        <SuggestionTag
          label="Suggested"
          value={suggestedName}
          onApply={onApplySuggested}
          onDismiss={onDismissSuggested}
        />
      )}
      {genericName && (
        <button
          type="button"
          className="suggestion-tag suggestion-tag-generic"
          onClick={onApplyGeneric}
        >
          {genericName}
        </button>
      )}
    </div>
  );
}

type WorkflowSuggestionProps = {
  suggestedName: string | null | undefined;
  dismissed: boolean;
  onApply: () => void;
  onDismiss: () => void;
};

export function WorkflowSuggestionTags({
  suggestedName,
  dismissed,
  onApply,
  onDismiss,
}: WorkflowSuggestionProps) {
  if (dismissed || !suggestedName) return null;

  return (
    <div className="suggestion-tags">
      <SuggestionTag
        label="Suggested workflow"
        value={suggestedName}
        onApply={onApply}
        onDismiss={onDismiss}
      />
    </div>
  );
}
