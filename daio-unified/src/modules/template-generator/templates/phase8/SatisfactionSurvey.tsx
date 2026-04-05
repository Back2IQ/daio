import { useI18n } from "../../i18n";
import { useTemplates } from "../../context/TemplateContext";
import { FormSection } from "../../components/FormSection";
import { FormField } from "../../components/FormField";
import type { SatisfactionSurveyData } from "../../types";

const DEFAULTS: SatisfactionSurveyData = {
  recipientName: "", overallSatisfaction: 0,
  communicationRating: 0, communicationSuggestions: "",
  competenceRating: 0, competenceSuggestions: "",
  transparencyRating: 0, transparencySuggestions: "",
  speedRating: 0, speedSuggestions: "",
  wouldRecommend: "UNDECIDED", additionalComments: "",
  date: new Date().toISOString().slice(0, 10),
};

function RatingField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">{label}</label>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} onClick={() => onChange(n)}
            className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
              value === n ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80 text-muted-foreground"
            }`}>
            {n}
          </button>
        ))}
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Very dissatisfied</span><span>Very satisfied</span>
      </div>
    </div>
  );
}

export function SatisfactionSurvey() {
  const { t } = useI18n();
  const { state, dispatch } = useTemplates();
  const data = { ...DEFAULTS, ...(state.templates["satisfaction-survey"].data as Partial<SatisfactionSurveyData>) };

  const update = (partial: Partial<SatisfactionSurveyData>) => {
    dispatch({ type: "UPDATE_TEMPLATE_DATA", template: "satisfaction-survey", data: partial });
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-sm">
        <p className="font-medium text-blue-800 dark:text-blue-300">CONFIDENTIAL</p>
        <p className="text-blue-700 dark:text-blue-400 mt-1">Your responses are used exclusively to improve our services and are treated confidentially.</p>
      </div>

      <FormSection title={t.sections.generalInfo}>
        <div className="grid md:grid-cols-2 gap-4">
          <FormField type="text" label={t.fields.recipientName} value={data.recipientName} onChange={(v) => update({ recipientName: v })} />
          <FormField type="date" label={t.fields.date} value={data.date} onChange={(v) => update({ date: v })} />
        </div>
      </FormSection>

      <FormSection title={t.sections.surveyQuestions}>
        <div className="space-y-6">
          <RatingField label="1. Overall Satisfaction — How satisfied were you overall with the settlement?" value={data.overallSatisfaction} onChange={(v) => update({ overallSatisfaction: v })} />

          <RatingField label="2. Communication — How do you rate communication during the process?" value={data.communicationRating} onChange={(v) => update({ communicationRating: v })} />
          <FormField type="textarea" label="Improvement Suggestions (Communication)" value={data.communicationSuggestions} onChange={(v) => update({ communicationSuggestions: v })} />

          <RatingField label="3. Competence — How do you rate the professional competence of the team?" value={data.competenceRating} onChange={(v) => update({ competenceRating: v })} />
          <FormField type="textarea" label="Improvement Suggestions (Competence)" value={data.competenceSuggestions} onChange={(v) => update({ competenceSuggestions: v })} />

          <RatingField label="4. Transparency — Were you always informed about the procedure status?" value={data.transparencyRating} onChange={(v) => update({ transparencyRating: v })} />
          <FormField type="textarea" label="Improvement Suggestions (Transparency)" value={data.transparencySuggestions} onChange={(v) => update({ transparencySuggestions: v })} />

          <RatingField label="5. Speed — How do you rate the speed of settlement?" value={data.speedRating} onChange={(v) => update({ speedRating: v })} />
          <FormField type="textarea" label="Improvement Suggestions (Speed)" value={data.speedSuggestions} onChange={(v) => update({ speedSuggestions: v })} />

          <FormField type="select" label="6. Would you recommend us?" value={data.wouldRecommend} onChange={(v) => update({ wouldRecommend: v as SatisfactionSurveyData["wouldRecommend"] })} options={[
            { value: "YES_DEFINITELY", label: "Yes, definitely" },
            { value: "PROBABLY", label: "Probably" },
            { value: "UNDECIDED", label: "Undecided" },
            { value: "PROBABLY_NOT", label: "Probably not" },
            { value: "NO", label: "No" },
          ]} />

          <FormField type="textarea" label="7. Additional Comments or Suggestions" value={data.additionalComments} onChange={(v) => update({ additionalComments: v })} />
        </div>
      </FormSection>
    </div>
  );
}
