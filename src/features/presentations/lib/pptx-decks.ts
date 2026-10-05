import { CONTACT_EMAIL } from "#/features/landing/lib/contact-email";
import type { AppLocale } from "#/i18n";
import { m } from "#/paraglide/messages";
import type { PresentationTemplateKey } from "./template-catalog";

// Deck copy and structure. Rendering lives in ./pptx-templates; this module is
// pure data so the narrative can be edited (and tested) without touching layout.

export type LocaleMessage = (
  inputs: Record<string, never>,
  options: { locale: AppLocale },
) => string;

export function msg(locale: AppLocale, message: LocaleMessage) {
  return message({}, { locale });
}

export type Metric = {
  value: string;
  label: string;
  delta?: string;
  dir?: "up" | "down";
};

export type Step = { title: string; desc: string };

export type BarChartData = { cats: string[]; vals: number[] };

export type SlideSpec =
  | { layout: "cover"; kicker: string; title: string; body: string }
  | {
      layout: "content";
      kicker: string;
      title: string;
      body: string;
      bullets?: string[];
      note?: { label: string; body: string };
    }
  | {
      layout: "metrics";
      kicker: string;
      title: string;
      body: string;
      metrics: Metric[];
      chart?: BarChartData;
    }
  | {
      layout: "chart";
      kicker: string;
      title: string;
      body: string;
      chart: BarChartData;
      caption?: string;
    }
  | {
      layout: "table";
      kicker: string;
      title: string;
      body: string;
      table: { head: string[]; rows: string[][] };
    }
  | {
      layout: "steps";
      kicker: string;
      title: string;
      body: string;
      steps: Step[];
    }
  | {
      layout: "closing";
      kicker: string;
      title: string;
      body: string;
      cta: string;
      contact: string;
    };

export type Deck = { label: string; slides: SlideSpec[] };

export function buildDecks(
  locale: AppLocale,
): Record<PresentationTemplateKey, Deck> {
  return {
    executive: {
      label: msg(locale, m.presentation_template_executive_name),
      slides: [
        {
          layout: "cover",
          kicker: msg(locale, m.presentation_template_executive_name),
          title: msg(locale, m.ppt_executive_cover_title),
          body: msg(locale, m.ppt_executive_cover_body),
        },
        {
          layout: "content",
          kicker: msg(locale, m.ppt_executive_situation_kicker),
          title: msg(locale, m.ppt_executive_situation_title),
          body: msg(locale, m.ppt_executive_situation_body),
          bullets: [
            msg(locale, m.ppt_executive_situation_bullet_1),
            msg(locale, m.ppt_executive_situation_bullet_2),
            msg(locale, m.ppt_executive_situation_bullet_3),
          ],
          note: {
            label: msg(locale, m.ppt_executive_note_label),
            body: msg(locale, m.ppt_executive_note_body),
          },
        },
        {
          layout: "metrics",
          kicker: msg(locale, m.ppt_executive_metrics_kicker),
          title: msg(locale, m.ppt_executive_metrics_title),
          body: msg(locale, m.ppt_executive_metrics_body),
          metrics: [
            {
              value: "82%",
              label: msg(locale, m.ppt_metric_adoption),
              delta: "6 pts",
              dir: "up",
            },
            {
              value: "-34%",
              label: msg(locale, m.ppt_metric_manual_time),
              delta: "34%",
              dir: "down",
            },
            {
              value: "1.4M",
              label: msg(locale, m.ppt_metric_records_day),
              delta: "12%",
              dir: "up",
            },
          ],
          chart: {
            cats: ["Q1", "Q2", "Q3", "Q4", "Q5"],
            vals: [42, 58, 53, 68, 81],
          },
        },
        {
          layout: "table",
          kicker: msg(locale, m.ppt_executive_risks_kicker),
          title: msg(locale, m.ppt_executive_risks_title),
          body: msg(locale, m.ppt_executive_risks_body),
          table: {
            head: [
              msg(locale, m.ppt_risk_head_risk),
              msg(locale, m.ppt_risk_head_impact),
              msg(locale, m.ppt_risk_head_mitigation),
            ],
            rows: [
              [
                msg(locale, m.ppt_risk_ownerless_source),
                msg(locale, m.ppt_impact_high),
                msg(locale, m.ppt_mitigation_assign_owner),
              ],
              [
                msg(locale, m.ppt_risk_etl_latency),
                msg(locale, m.ppt_impact_medium),
                msg(locale, m.ppt_mitigation_incremental_window),
              ],
              [
                msg(locale, m.ppt_risk_data_quality),
                msg(locale, m.ppt_impact_medium),
                msg(locale, m.ppt_mitigation_validation_rules),
              ],
            ],
          },
        },
        {
          layout: "closing",
          kicker: msg(locale, m.ppt_executive_close_kicker),
          title: msg(locale, m.ppt_executive_close_title),
          body: msg(locale, m.ppt_executive_close_body),
          cta: msg(locale, m.ppt_executive_cta),
          contact: "responsable@urbsdata.com",
        },
      ],
    },

    "data-review": {
      label: msg(locale, m.presentation_template_data_review_name),
      slides: [
        {
          layout: "cover",
          kicker: msg(locale, m.ppt_data_review_cover_kicker),
          title: msg(locale, m.ppt_data_review_cover_title),
          body: msg(locale, m.ppt_data_review_cover_body),
        },
        {
          layout: "metrics",
          kicker: msg(locale, m.ppt_data_review_scorecard_kicker),
          title: msg(locale, m.ppt_data_review_scorecard_title),
          body: msg(locale, m.ppt_data_review_scorecard_body),
          metrics: [
            {
              value: "98.6%",
              label: msg(locale, m.ppt_metric_uptime_pipeline),
              delta: "0.3",
              dir: "up",
            },
            {
              value: "12 min",
              label: msg(locale, m.ppt_metric_freshness),
              delta: "4 min",
              dir: "down",
            },
            {
              value: "94%",
              label: msg(locale, m.ppt_metric_test_coverage),
              delta: "5 pts",
              dir: "up",
            },
            {
              value: "0.2%",
              label: msg(locale, m.ppt_metric_rejected_rows),
              delta: "0.1",
              dir: "down",
            },
          ],
        },
        {
          layout: "chart",
          kicker: msg(locale, m.ppt_data_review_trend_kicker),
          title: msg(locale, m.ppt_data_review_trend_title),
          body: msg(locale, m.ppt_data_review_trend_body),
          chart: {
            cats: [
              msg(locale, m.ppt_month_may),
              msg(locale, m.ppt_month_jun),
              msg(locale, m.ppt_month_jul),
              msg(locale, m.ppt_month_aug),
              msg(locale, m.ppt_month_sep),
              msg(locale, m.ppt_month_oct),
            ],
            vals: [48, 55, 51, 62, 70, 84],
          },
          caption: msg(locale, m.ppt_data_review_caption),
        },
        {
          layout: "table",
          kicker: msg(locale, m.ppt_data_review_segments_kicker),
          title: msg(locale, m.ppt_data_review_segments_title),
          body: msg(locale, m.ppt_data_review_segments_body),
          table: {
            head: [
              msg(locale, m.ppt_segment_head_segment),
              msg(locale, m.ppt_segment_head_volume),
              msg(locale, m.ppt_segment_head_conversion),
              msg(locale, m.ppt_segment_head_trend),
            ],
            rows: [
              [
                msg(locale, m.ppt_segment_direct),
                "42%",
                "3.8%",
                msg(locale, m.ppt_trend_stable),
              ],
              [
                msg(locale, m.ppt_segment_referrals),
                "28%",
                "5.1%",
                msg(locale, m.ppt_trend_up),
              ],
              [
                msg(locale, m.ppt_segment_campaigns),
                "19%",
                "2.4%",
                msg(locale, m.ppt_trend_down),
              ],
              [
                msg(locale, m.ppt_segment_organic),
                "11%",
                "4.0%",
                msg(locale, m.ppt_trend_up),
              ],
            ],
          },
        },
        {
          layout: "closing",
          kicker: msg(locale, m.ppt_data_review_close_kicker),
          title: msg(locale, m.ppt_data_review_close_title),
          body: msg(locale, m.ppt_data_review_close_body),
          cta: msg(locale, m.ppt_data_review_cta),
          contact: "data@urbsdata.com",
        },
      ],
    },

    pitch: {
      label: msg(locale, m.presentation_template_pitch_name),
      slides: [
        {
          layout: "cover",
          kicker: msg(locale, m.ppt_pitch_cover_kicker),
          title: msg(locale, m.ppt_pitch_cover_title),
          body: msg(locale, m.ppt_pitch_cover_body),
        },
        {
          layout: "content",
          kicker: msg(locale, m.ppt_pitch_problem_kicker),
          title: msg(locale, m.ppt_pitch_problem_title),
          body: msg(locale, m.ppt_pitch_problem_body),
          bullets: [
            msg(locale, m.ppt_pitch_problem_bullet_1),
            msg(locale, m.ppt_pitch_problem_bullet_2),
            msg(locale, m.ppt_pitch_problem_bullet_3),
          ],
          note: {
            label: msg(locale, m.ppt_pitch_note_label),
            body: msg(locale, m.ppt_pitch_note_body),
          },
        },
        {
          layout: "steps",
          kicker: msg(locale, m.ppt_pitch_steps_kicker),
          title: msg(locale, m.ppt_pitch_steps_title),
          body: msg(locale, m.ppt_pitch_steps_body),
          steps: [
            {
              title: msg(locale, m.ppt_step_integrate_title),
              desc: msg(locale, m.ppt_step_integrate_desc),
            },
            {
              title: msg(locale, m.ppt_step_model_title),
              desc: msg(locale, m.ppt_step_model_desc),
            },
            {
              title: msg(locale, m.ppt_step_deliver_title),
              desc: msg(locale, m.ppt_step_deliver_desc),
            },
          ],
        },
        {
          layout: "metrics",
          kicker: msg(locale, m.ppt_pitch_impact_kicker),
          title: msg(locale, m.ppt_pitch_impact_title),
          body: msg(locale, m.ppt_pitch_impact_body),
          metrics: [
            {
              value: "-34%",
              label: msg(locale, m.ppt_metric_manual_time),
              delta: "34%",
              dir: "down",
            },
            {
              value: "3×",
              label: msg(locale, m.ppt_metric_reporting_speed),
              delta: "3×",
              dir: "up",
            },
            {
              value: "82%",
              label: msg(locale, m.ppt_metric_internal_adoption),
              delta: "6 pts",
              dir: "up",
            },
          ],
          chart: {
            cats: ["S1", "S2", "S3", "S4", "S5"],
            vals: [30, 44, 52, 66, 81],
          },
        },
        {
          layout: "closing",
          kicker: msg(locale, m.ppt_pitch_close_kicker),
          title: msg(locale, m.ppt_pitch_close_title),
          body: msg(locale, m.ppt_pitch_close_body),
          cta: msg(locale, m.ppt_pitch_cta),
          contact: msg(locale, m.ppt_pitch_contact),
        },
      ],
    },

    "case-study": {
      label: msg(locale, m.presentation_template_case_study_name),
      slides: [
        {
          layout: "cover",
          kicker: msg(locale, m.ppt_case_cover_kicker),
          title: msg(locale, m.ppt_case_cover_title),
          body: msg(locale, m.ppt_case_cover_body),
        },
        {
          layout: "content",
          kicker: msg(locale, m.ppt_case_challenge_kicker),
          title: msg(locale, m.ppt_case_challenge_title),
          body: msg(locale, m.ppt_case_challenge_body),
          bullets: [
            msg(locale, m.ppt_case_challenge_bullet_1),
            msg(locale, m.ppt_case_challenge_bullet_2),
            msg(locale, m.ppt_case_challenge_bullet_3),
          ],
          note: {
            label: msg(locale, m.ppt_case_note_label),
            body: msg(locale, m.ppt_case_note_body),
          },
        },
        {
          layout: "steps",
          kicker: msg(locale, m.ppt_case_approach_kicker),
          title: msg(locale, m.ppt_case_approach_title),
          body: msg(locale, m.ppt_case_approach_body),
          steps: [
            {
              title: msg(locale, m.ppt_case_source_title),
              desc: msg(locale, m.ppt_case_source_desc),
            },
            {
              title: msg(locale, m.ppt_case_warehouse_title),
              desc: msg(locale, m.ppt_case_warehouse_desc),
            },
            {
              title: msg(locale, m.ppt_case_consumption_title),
              desc: msg(locale, m.ppt_case_consumption_desc),
            },
          ],
        },
        {
          layout: "metrics",
          kicker: msg(locale, m.ppt_case_results_kicker),
          title: msg(locale, m.ppt_case_results_title),
          body: msg(locale, m.ppt_case_results_body),
          metrics: [
            {
              value: "-70%",
              label: msg(locale, m.ppt_metric_reporting_time),
              delta: "70%",
              dir: "down",
            },
            {
              value: "+41%",
              label: msg(locale, m.ppt_metric_on_time_decisions),
              delta: "41%",
              dir: "up",
            },
            {
              value: "1",
              label: msg(locale, m.ppt_metric_source_of_truth),
              delta: msg(locale, m.ppt_delta_unified),
              dir: "up",
            },
          ],
          chart: {
            cats: [
              msg(locale, m.ppt_case_before),
              "M1",
              "M2",
              "M3",
              msg(locale, m.ppt_case_now),
            ],
            vals: [22, 38, 51, 63, 79],
          },
        },
        {
          layout: "closing",
          kicker: msg(locale, m.ppt_case_close_kicker),
          title: msg(locale, m.ppt_case_close_title),
          body: msg(locale, m.ppt_case_close_body),
          cta: msg(locale, m.ppt_case_cta),
          contact: CONTACT_EMAIL,
        },
      ],
    },
  };
}
