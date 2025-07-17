import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

// ESM module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface CertificateData {
  userName: string;
  courseName: string;
  date: string;
  certificateId: string;
  issueDate?: string;
  expiryDate?: string;
  completionDate?: string;
}

export class CertificatePDFService {
  /**
   * Generate a personalized certificate PDF from a template
   * @param templatePath - Path to the PDF template file
   * @param certificateData - User and course data for replacement
   * @returns Buffer containing the filled PDF
   */
  static async generateCertificate(
    templatePath: string,
    certificateData: CertificateData
  ): Promise<Buffer> {
    try {
      console.log("🎓 Starting certificate generation...");
      console.log("📁 Template path:", templatePath);
      console.log("👤 Certificate data:", certificateData);

      // Validate template exists
      if (!(await this.validateTemplate(templatePath))) {
        throw new Error(`Certificate template not found: ${templatePath}`);
      }

      // Read the template PDF
      const templateBytes = await fs.readFile(templatePath);
      console.log("📄 Template loaded, size:", templateBytes.length, "bytes");

      // Load the PDF document
      const pdfDoc = await PDFDocument.load(templateBytes);
      console.log("✅ PDF document loaded successfully");

      // Get form and pages
      const form = pdfDoc.getForm();
      const pages = pdfDoc.getPages();
      console.log("📋 PDF has", pages.length, "pages");

      // Create placeholder mapping
      const placeholderMap = this.createPlaceholderMap(certificateData);
      console.log(
        "🔄 Placeholder mappings created:",
        Object.keys(placeholderMap)
      );

      // Try to fill interactive form fields first
      let hasFormFields = false;
      try {
        const fields = form.getFields();
        console.log("📝 Found", fields.length, "form fields");

        if (fields.length > 0) {
          hasFormFields = true;
          await this.fillFormFields(form, fields, placeholderMap);
          console.log("✅ Form fields filled successfully");
        }
      } catch (formError) {
        console.log(
          "ℹ️ No interactive form fields found or error accessing them"
        );
      }

      // If no form fields, overlay text on the PDF
      if (!hasFormFields) {
        console.log("🎨 Overlaying text on PDF...");
        await this.overlayTextOnPDF(pages, placeholderMap);
        console.log("✅ Text overlay completed");
      }

      // Save the PDF
      console.log("💾 Saving final PDF...");
      const pdfBytes = await pdfDoc.save();
      console.log(
        "✅ Certificate generated successfully, size:",
        pdfBytes.length,
        "bytes"
      );

      return Buffer.from(pdfBytes);
    } catch (error) {
      console.error("❌ Error generating certificate:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      throw new Error(`Failed to generate certificate: ${errorMessage}`);
    }
  }

  /**
   * Create a mapping of all possible placeholders to their values
   */
  private static createPlaceholderMap(
    data: CertificateData
  ): Record<string, string> {
    return {
      // Standard placeholder formats
      "{{USER_NAME}}": data.userName,
      "{{COURSE_NAME}}": data.courseName,
      "{{DATE}}": data.date,
      "{{CERTIFICATE_ID}}": data.certificateId,
      "{{ISSUE_DATE}}": data.issueDate || data.date,
      "{{EXPIRY_DATE}}": data.expiryDate || "",
      "{{COMPLETION_DATE}}": data.completionDate || data.date,

      // Alternative formats (spaces instead of underscores)
      "{{USER NAME}}": data.userName,
      "{{COURSE NAME}}": data.courseName,
      "{{CERTIFICATE ID}}": data.certificateId,
      "{{ISSUE DATE}}": data.issueDate || data.date,
      "{{EXPIRY DATE}}": data.expiryDate || "",
      "{{COMPLETION DATE}}": data.completionDate || data.date,

      // Alternative formats (no braces)
      "[USER_NAME]": data.userName,
      "[COURSE_NAME]": data.courseName,
      "[DATE]": data.date,
      "[CERTIFICATE_ID]": data.certificateId,

      // Alternative formats (single braces)
      "{USER_NAME}": data.userName,
      "{COURSE_NAME}": data.courseName,
      "{DATE}": data.date,
      "{CERTIFICATE_ID}": data.certificateId,
    };
  }

  /**
   * Fill interactive PDF form fields
   */
  private static async fillFormFields(
    form: any,
    fields: any[],
    placeholderMap: Record<string, string>
  ) {
    console.log("🔍 DEBUGGING FORM FIELDS:");
    console.log("📋 Available placeholders:", Object.keys(placeholderMap));
    console.log("📋 Placeholder values:", placeholderMap);

    fields.forEach((field, index) => {
      const fieldName = field.getName();
      const fieldType = field.constructor.name;

      console.log(`📝 Field ${index + 1}: ${fieldName} (${fieldType})`);

      if (fieldType === "PDFTextField") {
        const textField = form.getTextField(fieldName);
        let value = "";

        // Direct field name mapping
        const normalizedFieldName = fieldName
          .toLowerCase()
          .replace(/[^a-z]/g, "");
        console.log(`🔤 Normalized field name: "${normalizedFieldName}"`);

        // Check exact matches first
        Object.keys(placeholderMap).forEach((placeholder) => {
          const normalizedPlaceholder = placeholder
            .toLowerCase()
            .replace(/[{}[\]]/g, "");
          if (fieldName.toLowerCase() === normalizedPlaceholder) {
            value = placeholderMap[placeholder];
            console.log(
              `✅ EXACT MATCH: "${fieldName}" matches "${placeholder}" -> "${value}"`
            );
          }
        });

        // If no exact match, try pattern matching
        if (!value) {
          if (
            normalizedFieldName.includes("username") ||
            normalizedFieldName.includes("name")
          ) {
            value = placeholderMap["{{USER_NAME}}"];
            console.log(
              `🎯 PATTERN MATCH (name): "${fieldName}" -> "${value}"`
            );
          } else if (
            normalizedFieldName.includes("coursename") ||
            normalizedFieldName.includes("course")
          ) {
            value = placeholderMap["{{COURSE_NAME}}"];
            console.log(
              `🎯 PATTERN MATCH (course): "${fieldName}" -> "${value}"`
            );
          } else if (
            normalizedFieldName.includes("date") ||
            normalizedFieldName.includes("completion")
          ) {
            value = placeholderMap["{{DATE}}"];
            console.log(
              `🎯 PATTERN MATCH (date): "${fieldName}" -> "${value}"`
            );
          } else if (
            normalizedFieldName.includes("certificateid") ||
            normalizedFieldName.includes("id")
          ) {
            value = placeholderMap["{{CERTIFICATE_ID}}"];
            console.log(`🎯 PATTERN MATCH (id): "${fieldName}" -> "${value}"`);
          }
        }

        if (value) {
          console.log(`✏️ Setting field '${fieldName}' to: "${value}"`);
          textField.setText(value);

          // Verify the field was set
          try {
            const setText = textField.getText();
            console.log(
              `✅ Verification: field '${fieldName}' now contains: "${setText}"`
            );
          } catch (e) {
            const errorMessage =
              e instanceof Error ? e.message : "Unknown error occurred";
            console.log(`⚠️ Could not verify field content: ${errorMessage}`);
          }
        } else {
          console.log(`❌ No value found for field: "${fieldName}"`);
        }
      } else {
        console.log(`ℹ️ Skipping non-text field: ${fieldName} (${fieldType})`);
      }
    });

    console.log("🔒 Flattening form to make fields non-editable...");
    // Flatten form to make it non-editable
    form.flatten();
    console.log("✅ Form flattened successfully");
  }

  /**
   * Overlay text on PDF pages when no form fields are available
   */
  private static async overlayTextOnPDF(
    pages: any[],
    placeholderMap: Record<string, string>
  ) {
    const firstPage = pages[0];
    if (!firstPage) {
      console.log("❌ No pages found for text overlay");
      return;
    }

    const { width, height } = firstPage.getSize();
    console.log(`📐 Page dimensions: ${width} x ${height}`);
    console.log("🎨 DEBUGGING TEXT OVERLAY:");
    console.log("📋 Available placeholders:", Object.keys(placeholderMap));
    console.log("📋 Placeholder values:", placeholderMap);

    // Load fonts
    const helvetica = await firstPage.doc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await firstPage.doc.embedFont(
      StandardFonts.HelveticaBold
    );
    console.log("🔤 Fonts loaded: Helvetica, HelveticaBold");

    // Define text overlay positions with better visibility
    const textOverlays = [
      // User name (prominent, center area with background)
      {
        text: placeholderMap["{{USER_NAME}}"],
        x: width * 0.5,
        y: height * 0.7,
        size: 28,
        font: helveticaBold,
        centered: true,
        label: "User Name",
        backgroundColor: true,
        color: rgb(0.1, 0.1, 0.5), // Dark blue
      },
      // Course name (below user name with background)
      {
        text: placeholderMap["{{COURSE_NAME}}"],
        x: width * 0.5,
        y: height * 0.55,
        size: 20,
        font: helvetica,
        centered: true,
        label: "Course Name",
        backgroundColor: true,
        color: rgb(0.2, 0.2, 0.2), // Dark gray
      },
      // Date (lower left, clear background)
      {
        text: `Completed: ${placeholderMap["{{DATE}}"]}`,
        x: width * 0.1,
        y: height * 0.15,
        size: 14,
        font: helvetica,
        centered: false,
        label: "Date",
        backgroundColor: true,
        color: rgb(0, 0, 0), // Black
      },
      // Certificate ID (lower right, clear background)
      {
        text: `Certificate ID: ${placeholderMap["{{CERTIFICATE_ID}}"]}`,
        x: width * 0.9,
        y: height * 0.1,
        size: 12,
        font: helvetica,
        centered: true,
        label: "Certificate ID",
        backgroundColor: true,
        color: rgb(0, 0, 0), // Black
      },
    ];

    let overlaysAdded = 0;
    textOverlays.forEach((overlay, index) => {
      console.log(`🎨 Processing overlay ${index + 1} (${overlay.label}):`, {
        text: overlay.text,
        x: overlay.x,
        y: overlay.y,
        size: overlay.size,
        centered: overlay.centered,
      });

      if (overlay.text && overlay.text.trim() && overlay.text !== "undefined") {
        try {
          // Calculate text dimensions for centering and background
          const textWidth = overlay.text.length * overlay.size * 0.6;
          const textHeight = overlay.size * 1.2;

          const x = overlay.centered ? overlay.x - textWidth / 2 : overlay.x;

          // Draw background rectangle for better visibility
          if (overlay.backgroundColor) {
            const padding = 8;
            firstPage.drawRectangle({
              x: x - padding,
              y: overlay.y - padding,
              width: textWidth + padding * 2,
              height: textHeight,
              color: rgb(1, 1, 1), // White background
              opacity: 0.9,
            });

            // Draw border around background
            firstPage.drawRectangle({
              x: x - padding,
              y: overlay.y - padding,
              width: textWidth + padding * 2,
              height: textHeight,
              borderColor: rgb(0.8, 0.8, 0.8), // Light gray border
              borderWidth: 1,
            });
          }

          // Draw the text
          firstPage.drawText(overlay.text, {
            x,
            y: overlay.y,
            size: overlay.size,
            font: overlay.font,
            color: overlay.color || rgb(0, 0, 0),
          });

          overlaysAdded++;
          console.log(
            `✅ Added ${overlay.label}: "${overlay.text}" at (${x.toFixed(
              1
            )}, ${overlay.y}) with ${
              overlay.backgroundColor ? "background" : "no background"
            }`
          );
        } catch (drawError) {
          console.error(`❌ Error drawing ${overlay.label}:`, drawError);
        }
      } else {
        console.log(`⚠️ Skipping ${overlay.label}: empty or undefined text`);
      }
    });

    console.log(
      `🎨 Text overlay complete: ${overlaysAdded}/${textOverlays.length} overlays added`
    );
  }

  /**
   * Get the absolute path for a certificate template
   */
  static resolveTemplatePath(templateUrl: string): string {
    console.log("🔧 Resolving template path for:", templateUrl);

    if (templateUrl.startsWith("/uploads/")) {
      // URL format: /uploads/images/filename.pdf
      // Convert to: server/../public/uploads/images/filename.pdf
      const resolvedPath = path.join(__dirname, "..", "public", templateUrl);
      console.log("📁 Resolved public path:", resolvedPath);
      return resolvedPath;
    } else if (templateUrl.startsWith("./uploads/")) {
      // Local path format: ./uploads/media/filename.pdf
      // Convert to absolute path from project root
      const resolvedPath = path.resolve(templateUrl);
      console.log("📁 Resolved relative path:", resolvedPath);
      return resolvedPath;
    } else if (templateUrl.startsWith("http")) {
      // External URL - not supported
      throw new Error("External template URLs not supported");
    } else if (path.isAbsolute(templateUrl)) {
      // Already absolute path
      console.log("📁 Using absolute path:", templateUrl);
      return templateUrl;
    } else {
      // Try to resolve relative to project root first
      const projectRootPath = path.resolve(templateUrl);
      console.log("📁 Trying project root path:", projectRootPath);

      // If that doesn't work, try relative to attached_assets (for development)
      if (!fs.existsSync(projectRootPath)) {
        const attachedAssetsPath = path.resolve("attached_assets", templateUrl);
        console.log("📁 Trying attached_assets path:", attachedAssetsPath);
        return attachedAssetsPath;
      }

      return projectRootPath;
    }
  }

  /**
   * Validate that a template file exists and is readable
   */
  static async validateTemplate(templatePath: string): Promise<boolean> {
    try {
      await fs.access(templatePath, fs.constants.R_OK);
      const stats = await fs.stat(templatePath);
      return stats.isFile() && stats.size > 0;
    } catch {
      return false;
    }
  }
}
