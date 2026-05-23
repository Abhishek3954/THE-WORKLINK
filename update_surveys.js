const fs = require('fs');

const gigSurveyPath = 'd:\\Worklink (botted)\\components\\gig-worker-survey.tsx';
let gigContent = fs.readFileSync(gigSurveyPath, 'utf8');

gigContent = gigContent.replace(
  'import { useWorkflow } from \'@/lib/workflow-context\'',
  'import { useWorkflow } from \'@/lib/workflow-context\'\nimport { useLanguage } from \'@/lib/i18n-context\''
);

gigContent = gigContent.replace(
  'const { workerData, updateWorkerData, setCurrentStep } = useWorkflow()',
  'const { workerData, updateWorkerData, setCurrentStep } = useWorkflow()\n  const { t } = useLanguage()'
);

gigContent = gigContent.replace(/label=\{skill\.label\}/g, 'label={t(skill.label)}');
gigContent = gigContent.replace(/<span className=\"text-sm font-medium\">\{skill\}<\/span>/g, '<span className=\"text-sm font-medium\">{t(skill)}</span>');
gigContent = gigContent.replace(/<span className=\"text-sm font-medium\">\{option\}<\/span>/g, '<span className=\"text-sm font-medium\">{t(option)}</span>');
gigContent = gigContent.replace(/<SelectItem key=\{option\} value=\{option\}>\{option\}<\/SelectItem>/g, '<SelectItem key={option} value={option}>{t(option)}</SelectItem>');
gigContent = gigContent.replace(/<Label>([^<]+)<\/Label>/g, (match, p1) => '<Label>{t(\'' + p1 + '\')}</Label>');
gigContent = gigContent.replace(/<span className=\"text-sm font-medium\">Yes<\/span>/g, '<span className=\"text-sm font-medium\">{t(\'Yes\')}</span>');
gigContent = gigContent.replace(/<span className=\"text-sm font-medium\">No<\/span>/g, '<span className=\"text-sm font-medium\">{t(\'No\')}</span>');
gigContent = gigContent.replace(/Upload \{profile\.idProofType\}/g, '{t(\'Upload\')} {t(profile.idProofType)}');
gigContent = gigContent.replace(/Upload Work Photos/g, '{t(\'Upload Work Photos\')}');
gigContent = gigContent.replace(/title=\{getStepTitle\(\)\}/g, 'title={t(getStepTitle())}');
gigContent = gigContent.replace(/subtitle=\{getStepSubtitle\(\)\}/g, 'subtitle={t(getStepSubtitle())}');
gigContent = gigContent.replace(/nextLabel=\{step === TOTAL_STEPS \? \'Complete Profile\' : \'Continue\'\}/g, 'nextLabel={step === TOTAL_STEPS ? t(\'Complete Profile\') : t(\'Continue\')}');

fs.writeFileSync(gigSurveyPath, gigContent);
console.log('Updated gig-worker-survey.tsx');

const wlSurveyPath = 'd:\\Worklink (botted)\\components\\worklink-survey.tsx';
let wlContent = fs.readFileSync(wlSurveyPath, 'utf8');

wlContent = wlContent.replace(
  'import { useWorkflow } from \'@/lib/workflow-context\'',
  'import { useWorkflow } from \'@/lib/workflow-context\'\nimport { useLanguage } from \'@/lib/i18n-context\''
);

wlContent = wlContent.replace(
  'const { workerData, updateWorkerData, setCurrentStep } = useWorkflow()',
  'const { workerData, updateWorkerData, setCurrentStep } = useWorkflow()\n  const { t } = useLanguage()'
);

wlContent = wlContent.replace(/<span className=\"text-sm font-medium flex-1\">\{option\.label\}<\/span>/g, '<span className=\"text-sm font-medium flex-1\">{t(option.label)}</span>');
wlContent = wlContent.replace(/<Label>([^<]+)<\/Label>/g, (match, p1) => '<Label>{t(\'' + p1 + '\')}</Label>');
wlContent = wlContent.replace(/<span className=\"text-sm font-medium\">Yes, I will upload<\/span>/g, '<span className=\"text-sm font-medium\">{t(\'Yes, I will upload\')}</span>');
wlContent = wlContent.replace(/title=\{getStepTitle\(\)\}/g, 'title={t(getStepTitle())}');
wlContent = wlContent.replace(/subtitle=\{getStepSubtitle\(\)\}/g, 'subtitle={t(getStepSubtitle())}');
wlContent = wlContent.replace(/nextLabel=\{step === TOTAL_STEPS \? \'Submit Application\' : \'Continue\'\}/g, 'nextLabel={step === TOTAL_STEPS ? t(\'Submit Application\') : t(\'Continue\')}');

fs.writeFileSync(wlSurveyPath, wlContent);
console.log('Updated worklink-survey.tsx');
