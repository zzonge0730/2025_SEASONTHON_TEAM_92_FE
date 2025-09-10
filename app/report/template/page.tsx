'use client';

import ReportTemplateComponent from '@/components/ReportTemplate';
import { mockReportData } from '@/lib/mockData';

export default function ReportTemplatePage() {
  return <ReportTemplateComponent data={mockReportData} />;
}