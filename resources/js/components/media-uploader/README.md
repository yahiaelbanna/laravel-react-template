# MediaUploader

A production-ready, Shadcn UI-styled media uploader for React 19 & TypeScript supporting images, interactive image cropping, video uploads with automatic & manual thumbnail extraction, and generic file uploads.

## Architecture

```
resources/js/components/media-uploader/
├── index.ts                          # Public barrel exports
├── types.ts                          # TypeScript interfaces & discriminated unions
├── media-uploader.tsx                # Main MediaUploader component & imperative ref API
├── media-uploader-examples.tsx       # Working examples for all media modes & XHR adapter
├── hooks/
│   └── use-media-uploader.ts         # State, upload queue, abort & object URL lifecycle
├── components/
│   ├── upload-dropzone.tsx           # Drag-and-drop + accessible file picker
│   ├── media-preview.tsx             # Unified preview card for image, video & file items
│   ├── image-cropper.tsx             # Interactive Canvas cropper dialog (4 corner handles, zoom, pan, live preview)
│   ├── video-thumbnail.tsx           # Video player + timeline frame scrubber dialog
│   └── file-preview.tsx              # File type icon card + PDF/CSV/TXT preview dialog
└── utils/
    ├── file-validation.ts            # MIME, accept, size, duplicate & magic-byte header checks
    ├── image-processing.ts           # Dimensions, aspect-ratio matching, GIF detection, Canvas crop
    └── video-processing.ts           # HTMLVideoElement metadata, seek & frame-to-File extraction
```

## Dependencies

Zero additional npm packages were required. The component reuses the existing project stack:
- **React 19** & **TypeScript**
- **Shadcn UI / Radix UI primitives** (`Dialog`, `Button`, `Card`, `Progress`, `Tooltip`, `Separator`, `DropdownMenu`, `Alert`, `Skeleton`, `Badge`)
- **Lucide React** icons
- **Native Browser APIs** (`HTMLCanvasElement`, `HTMLVideoElement`, `PointerEvent`, `File` / `Blob` / `URL.createObjectURL`)

## Critical Guarantees

### Image Cropping
1. Enabling `crop={{ enabled: true }}` never auto-crops or modifies images on selection.
2. Initial previews always display the full original image (`object-contain`, never `object-fit: cover`).
3. If the image already matches `crop.aspectRatio` (or free aspect ratio) and the user does not modify the crop box, the exact original `File` is preserved without re-encoding.
4. If the image does not match `crop.aspectRatio`, the cropper initializes with a centered crop rect of the target ratio, which the user can resize (4 corner handles) and reposition.
5. Animated GIFs are detected and preserved untouched when cropping is disabled or skipped.
6. `originalFile` and `processedFile` are tracked separately; `item.file` always points to the active file (`processedFile ?? originalFile`).

### Video & Thumbnails
1. Each video item maintains its original `file` alongside its generated `thumbnail: File` and `thumbnailPreview: string`.
2. The video preview (`<video controls />`) is never replaced by the thumbnail; the thumbnail is shown in its own dedicated strip with **Regenerate** and **Pick frame** actions.
3. Temporary `<video>` elements, event listeners, and `blob:` URLs are cleaned up on completion, item removal, or unmount.

### Upload Lifecycle
- Item states: `"idle" | "processing" | "uploading" | "success" | "error"`.
- Progress is never simulated; `uploadHandler(file, onProgress, context)` reports real transfer progress.
- `autoUpload` defaults to `false` so files are only uploaded when `autoUpload={true}` or when `ref.current.uploadAll()` / item Upload is triggered.

## React Hook Form Integration

```tsx
import { Controller, useForm } from "react-hook-form";
import { MediaUploader, type MediaItem, type MediaUploaderValue } from "@/components/media-uploader";

interface FormValues {
  attachments: MediaItem[];
}

export function PostForm() {
  const { control, handleSubmit } = useForm<FormValues>({
    defaultValues: { attachments: [] },
  });

  const latestSubmissionRef = React.useRef<MediaUploaderValue>({
    images: [],
    videos: [],
    files: [],
  });

  const onSubmit = () => {
    const { images, videos, files } = latestSubmissionRef.current;
    const formData = new FormData();
    images.forEach((img) => formData.append("images[]", img));
    videos.forEach((v, i) => {
      formData.append(`videos[${i}][file]`, v.file);
      if (v.thumbnail) formData.append(`videos[${i}][thumbnail]`, v.thumbnail);
    });
    files.forEach((f) => formData.append("files[]", f));
    // Submit formData...
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name="attachments"
        control={control}
        render={({ field, fieldState }) => (
          <MediaUploader
            multiple
            maxFiles={10}
            accept="image/*,video/*,.pdf"
            value={field.value}
            onChange={(items, submission) => {
              latestSubmissionRef.current = submission;
              field.onChange(items);
            }}
            aria-invalid={Boolean(fieldState.error)}
          />
        )}
      />
    </form>
  );
}
```

## FieldRenderer Integration

In `FieldRenderer`, a `"media"` field type can render `<MediaUploader>` directly and pass `(items, submission)` or `submission` to `onChange`:

```tsx
case "media":
  return (
    <MediaUploader
      {...field.mediaProps}
      disabled={field.disabled}
      readOnly={field.readonly}
      value={value}
      onChange={(items) => onChange?.(items)}
      aria-invalid={!!error}
    />
  );
```
