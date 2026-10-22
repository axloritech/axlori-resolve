"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, ImagePlus, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import Button, { buttonClasses } from "@/components/ui/Button";
import Card, { CardHeader } from "@/components/ui/Card";
import DemoNote from "@/components/ui/DemoNote";
import { FormField, Input, Select, Textarea } from "@/components/ui/Field";
import Spinner from "@/components/ui/Spinner";
import { ACCEPTED_IMAGE_TYPES, CATEGORIES, MAX_IMAGE_BYTES, PRIORITIES, ROLE_LABEL } from "@/lib/constants";
import { LOCATION_NAMES } from "@/lib/mock-data";
import { useAppStore } from "@/lib/store";
import type { Report } from "@/types";

const schema = z.object({
  title: z
    .string()
    .trim()
    .min(6, "Give the issue a title of at least 6 characters.")
    .max(100, "Keep the title under 100 characters."),
  description: z
    .string()
    .trim()
    .min(30, "Describe the issue in at least 30 characters so staff can act on it.")
    .max(1000, "Keep the description under 1000 characters."),
  category: z.enum(CATEGORIES as [string, ...string[]], {
    message: "Choose a category.",
  }),
  location: z.string().min(1, "Choose a campus location."),
  building: z.string().trim().max(60, "Keep the building or room under 60 characters.").optional().or(z.literal("")),
  priority: z.enum(PRIORITIES as [string, ...string[]], {
    message: "Choose a priority.",
  }),
});

type FormValues = z.infer<typeof schema>;

/**
 * Mock submission form. Validation is real; the report is stored in local
 * frontend state only and is never sent to a server in this phase.
 */
export default function ReportForm() {
  const router = useRouter();
  const { addReport, currentUser, pushToast } = useAppStore();

  const [image, setImage] = useState<{ name: string; size: number; dataUrl: string } | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<Report | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { category: undefined, location: "", building: "", priority: "Medium" },
  });

  // Revoke nothing on unmount: using data URLs, safe by design.
  useEffect(() => () => {}, []);

  function onPickImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setImageError(null);
    if (!file) return;
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setImageError("Unsupported file type. Use a JPG, PNG, or WebP image.");
      e.target.value = "";
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setImageError(`Image is too large. Maximum size is ${Math.round(MAX_IMAGE_BYTES / (1024 * 1024))} MB.`);
      e.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setImage({ name: file.name, size: file.size, dataUrl: String(reader.result) });
    };
    reader.onerror = () => setImageError("Could not read that file. Try another image.");
    reader.readAsDataURL(file);
  }

  function removeImage() {
    setImage(null);
    setImageError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function onSubmit(values: FormValues) {
    if (submitting) return; // guard against accidental double submission
    setSubmitting(true);
    try {
      // Simulated latency only: nothing leaves this browser.
      await new Promise((resolve) => setTimeout(resolve, 900));
      const report = addReport({
        title: values.title.trim(),
        description: values.description.trim(),
        category: values.category as Report["category"],
        location: values.location,
        building: values.building?.trim() || undefined,
        priority: values.priority as Report["priority"],
        imageUrl: image?.dataUrl,
      });
      pushToast("success", `Report ${report.id} submitted and stored locally in this demo.`);
      setSubmitted(report);
      reset();
      removeImage();
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <Card className="mx-auto max-w-2xl p-8 text-center">
        <span aria-hidden className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-50">
          <CheckCircle2 className="h-6 w-6 text-success" />
        </span>
        <h2 className="mt-4 text-lg font-semibold text-ink">Report submitted in this demo</h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          <span className="font-medium text-ink">{submitted.id}</span> &ldquo;{submitted.title}&rdquo; was stored in this
          browser&rsquo;s local demo state. Nothing was sent to a server, and campus staff have not received it; that
          requires the backend integration planned for a later phase.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
          <Link href={`/reports/${submitted.id}`} className={buttonClasses("primary", "md")}>
            View report
          </Link>
          <Button variant="secondary" onClick={() => setSubmitted(null)}>
            Submit another report
          </Button>
          <Button variant="ghost" onClick={() => router.push("/reports")}>
            Back to reports
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader
        title="Report an issue"
        subtitle={`Submitting as ${currentUser.name} (${ROLE_LABEL[currentUser.role]}, demo persona)`}
      />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 px-5 py-5" noValidate>
        <DemoNote>
          Frontend-only demo: submissions are validated and stored in local state, not uploaded. Do not include personal
          or sensitive information in demo reports.
        </DemoNote>

        <FormField label="Issue title" htmlFor="title" required error={errors.title?.message}>
          <Input
            id="title"
            placeholder="e.g. Broken projector in Lecture Theatre 2"
            aria-invalid={!!errors.title}
            aria-describedby={errors.title ? "title-error" : undefined}
            {...register("title")}
          />
        </FormField>

        <FormField label="Detailed description" htmlFor="description" required error={errors.description?.message}>
          <Textarea
            id="description"
            placeholder="What is wrong, where exactly, and since when? Staff use this to plan the fix."
            aria-invalid={!!errors.description}
            aria-describedby={errors.description ? "description-error" : undefined}
            {...register("description")}
          />
        </FormField>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <FormField label="Category" htmlFor="category" required error={errors.category?.message}>
            <Select id="category" aria-invalid={!!errors.category} {...register("category")}>
              <option value="" disabled>
                Select a category
              </option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField label="Campus location" htmlFor="location" required error={errors.location?.message}>
            <Select id="location" aria-invalid={!!errors.location} {...register("location")}>
              <option value="" disabled>
                Select a location
              </option>
              {LOCATION_NAMES.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField label="Building or room" htmlFor="building" hint="Optional, e.g. 2nd floor or Room 204." error={errors.building?.message}>
            <Input id="building" placeholder="e.g. Lecture Theatre 2" {...register("building")} />
          </FormField>

          <FormField label="Priority" htmlFor="priority" required error={errors.priority?.message} hint="Use Urgent only for immediate safety or outage issues.">
            <Select id="priority" aria-invalid={!!errors.priority} {...register("priority")}>
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </Select>
          </FormField>
        </div>

        <FormField
          label="Photo"
          htmlFor="image"
          hint="Optional. JPG, PNG, or WebP up to 5 MB. In the demo the image stays in your browser."
          error={imageError ?? undefined}
        >
          {image ? (
            <div className="rounded-lg border border-line p-3">
              {/* eslint-disable-next-line @next/next/no-img-element -- preview of a locally selected file */}
              <img
                src={image.dataUrl}
                alt={`Preview of selected image: ${image.name}`}
                className="max-h-52 w-auto rounded-md border border-line object-contain"
              />
              <div className="mt-2 flex items-center justify-between gap-2">
                <p className="truncate text-xs text-muted">
                  {image.name} · {(image.size / 1024).toFixed(0)} KB
                </p>
                <Button type="button" variant="ghost" size="sm" onClick={removeImage}>
                  <Trash2 aria-hidden className="h-4 w-4" />
                  Remove
                </Button>
              </div>
            </div>
          ) : (
            <label
              htmlFor="image"
              className="flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-300 bg-page px-4 py-8 text-center transition-colors hover:border-primary hover:bg-primary-subtle/40"
            >
              <ImagePlus aria-hidden className="h-6 w-6 text-muted" />
              <span className="text-sm font-medium text-ink">Choose a photo</span>
              <span className="text-xs text-muted">JPG, PNG, or WebP, up to 5 MB</span>
            </label>
          )}
          <input
            ref={fileInputRef}
            id="image"
            type="file"
            accept={ACCEPTED_IMAGE_TYPES.join(",")}
            onChange={onPickImage}
            className={image ? "mt-2 text-sm text-muted file:mr-3 file:rounded-lg file:border file:border-line file:bg-card file:px-3 file:py-1.5 file:text-sm file:text-ink" : "sr-only"}
          />
        </FormField>

        <div className="flex flex-col-reverse gap-2 border-t border-line pt-5 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={() => router.push("/reports")} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting} aria-busy={submitting}>
            {submitting ? (
              <>
                <Spinner className="h-4 w-4" label="Submitting" />
                Submitting locally…
              </>
            ) : (
              "Submit report"
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
}
