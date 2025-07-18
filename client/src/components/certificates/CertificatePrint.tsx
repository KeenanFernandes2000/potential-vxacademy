import React from "react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Printer, Download } from "lucide-react";

interface CertificatePrintProps {
  certificate: {
    id: number;
    certificateNumber: string;
    createdAt: string;
    user: {
      firstName: string;
      lastName: string;
    };
    course: {
      name: string;
    };
  };
  onClose?: () => void;
}

export function CertificatePrint({
  certificate,
  onClose,
}: CertificatePrintProps) {
  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    try {
      const response = await fetch(`/api/certificates/${certificate.id}/pdf`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `certificate-${certificate.certificateNumber}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        console.error("Failed to download certificate PDF");
      }
    } catch (error) {
      console.error("Error downloading certificate:", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Print Controls - Hidden during printing */}
      <div className="print:hidden mb-4 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Your Certificate</h2>
        <div className="flex gap-2">
          <Button onClick={handlePrint} className="flex items-center gap-2">
            <Printer className="h-4 w-4" />
            Print Certificate
          </Button>
          <Button
            onClick={handleDownloadPDF}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
          {onClose && (
            <Button onClick={onClose} variant="outline">
              Close
            </Button>
          )}
        </div>
      </div>

      {/* Certificate Content */}
      <div className="bg-white border-8 border-double border-teal-600/30 p-12 rounded-lg shadow-lg print:shadow-none print:border-gray-400">
        <div className="certificate-container relative flex flex-col items-center text-center">
          {/* Decorative corners */}
          <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-teal-600 rounded-tl-lg"></div>
          <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-teal-600 rounded-tr-lg"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-teal-600 rounded-bl-lg"></div>
          <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-teal-600 rounded-br-lg"></div>

          {/* Logo/Header */}
          <div className="mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-teal-600 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-3xl font-bold">VX</span>
            </div>
            <h1 className="text-3xl font-bold text-teal-700 mb-2">
              VX Academy
            </h1>
            <div className="w-32 h-1 bg-gradient-to-r from-teal-600 to-cyan-600 mx-auto"></div>
          </div>

          {/* Certificate Header */}
          <div className="certificate-header mb-8">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Certificate of Completion
            </h2>
            <p className="text-xl text-gray-600">This is to certify that</p>
          </div>

          {/* Recipient Name */}
          <div className="mb-8">
            <h3 className="text-5xl font-bold text-teal-700 mb-2 border-b-2 border-teal-200 pb-2">
              {certificate.user.firstName} {certificate.user.lastName}
            </h3>
          </div>

          {/* Achievement */}
          <div className="mb-8">
            <p className="text-xl text-gray-700 mb-3">
              has successfully completed the course
            </p>
            <h4 className="text-3xl font-bold text-gray-800 mb-4 px-4 py-2 bg-gray-50 rounded-lg border">
              {certificate.course.name}
            </h4>
          </div>

          {/* Certificate Details */}
          <div className="mb-8 text-gray-600">
            <div className="flex justify-center items-center gap-8 mb-4">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-500">
                  Certificate ID
                </p>
                <p className="text-lg font-mono font-bold">
                  {certificate.certificateNumber}
                </p>
              </div>
              <div className="w-px h-12 bg-gray-300"></div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-500">Date Issued</p>
                <p className="text-lg font-bold">
                  {format(new Date(certificate.createdAt), "MMMM d, yyyy")}
                </p>
              </div>
            </div>
          </div>

          {/* Signature Section */}
          <div className="flex justify-between items-end w-full max-w-2xl">
            <div className="text-center">
              <div className="w-48 border-t-2 border-gray-400 mb-2"></div>
              <p className="text-sm font-medium text-gray-600">
                Director, VX Academy
              </p>
              <p className="text-xs text-gray-500">Abu Dhabi, UAE</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mb-2">
                <span className="text-teal-700 text-sm font-bold">SEAL</span>
              </div>
              <p className="text-xs text-gray-500">Official Seal</p>
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body {
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
          }

          .certificate-container {
            page-break-inside: avoid;
          }

          @page {
            margin: 0.5in;
            size: landscape;
          }
        }
      `}</style>
    </div>
  );
}
