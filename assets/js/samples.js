/**
 * MarkSnap Preloaded Sample Documents
 */
window.MarkSnapSamples = {
  persian: `# راهنمای جامع معماری و استانداردهای توسعه نرم‌افزار

> **مخاطبان:** توسعه‌دهندگان، مهندسان معمار و دستیاران هوش مصنوعی  
> **سیستم عامل و بستر:** لینوکس / داکر / لاراول ۱۱ / دیتابیس پستگرس  
> **زبان و تایپوگرافی:** زبان فارسی با قلم زیبای **وزیرمتن** و پشتیبانی کامل راست‌به‌چپ (RTL)

---

## ۱. اصول طلایی مهندسی نرم‌افزار

۱. **جداسازی وظایف (Single Responsibility):** هر کلاس و ماژول تنها یک مسئولیت مشخص در سیستم دارد.
۲. **طراحی نازک کنترلرها (Thin Controllers):** تمام منطق تجاری باید به لایه سرویس‌ها و اکشن‌ها منتقل شود.
۳. **تراکنش‌های امن پایگاه داده:** عملیات چندمرحله‌ای باید در قالب \`DB::transaction()\` اجرا شوند.
۴. **مدیریت ساختاریافته خطاها:** پرتاب استثناهای سفارشی برای پیش‌بینی خطاهای دامنه‌ای.

> [!TIP]
> برای نمایش اعداد به فرمت فارسی در خروجی، از توابع کمکی استاندارد سیستم استفاده کنید.

---

## ۲. نمونه جدول ویژگی‌های سیستم

| نام ماژول | سطح دسترسی | وضعیت پیاده‌سازی | بازبینی امنیتی |
| :--- | :--- | :---: | :--- |
| **احراز هویت دومرحله‌ای** | تمامی کاربران | ✅ تکمیل شده | تایید شده توسط تیم قرمز |
| **داشبورد گزارشات مالی** | مدیران مالی | 🔄 در حال توسعه | در صف بررسی |
| **مدیریت انبار و کالا** | انبارداران | ✅ پایدار | آزمون نفوذ انجام شد |

---

## ۳. قطعه کد نمونه (PHP 8.3 & Laravel)

\`\`\`php
namespace Modules\\Hr\\Services;

use App\\Models\\BaseModel;
use Illuminate\\Support\\Facades\\DB;

final class StaffApprovalAction
{
    public function execute(int $staffId, int $managerId): bool
    {
        return DB::transaction(function () use ($staffId, $managerId) {
            $staff = Staff::query()->lockForUpdate()->findOrFail($staffId);
            $staff->markAsApprovedBy($managerId);
            
            event(new StaffApprovedEvent($staff));
            return true;
        });
    }
}
\`\`\`

---

## ۴. چرخه فرآیند تایید (نمودار فلوچارت)

\`\`\`mermaid
flowchart LR
    A[ثبت درخواست] --> B{بررسی مدیر مستقیم}
    B -- تایید --> C[ارزیابی منابع انسانی]
    B -- رد --> D[ارجاع جهت اصلاح]
    C --> E[صدور ابلاغیه نهایی]
\`\`\`

---

## ۵. چک‌لیست اقدامات بعدی
- [x] بررسی عملکرد بر روی سرورهای با بار ترافیکی بالا
- [x] استانداردسازی فونت‌های فارسی در محیط وب
- [ ] ادغام نهایی با خط لوله CI/CD
`,

  architecture: `# System Architecture & Coding Guidelines

> **Target:** Microservices & Modular Monolith Applications  
> **Stack:** PHP 8.3 | Laravel 11 | OpenSwoole | Redis | PostgreSQL  
> **Security Baseline:** OWASP ASVS 4.0 Level 2

---

## 1. Core Architecture Tenets

1. **Invokable Single-Action Controllers:** Every endpoint maps to an invokable controller with \`__invoke()\`.
2. **Strict Response Contracts:** All responses return \`Symfony\\Component\\HttpFoundation\\Response\`.
3. **Domain Event Richness:** Domain events are dispatched after transactions commit.
4. **Idempotency Guarantees:** All mutation endpoints require an \`Idempotency-Key\` header.

> [!NOTE]
> Database queries must never be executed directly within HTTP Controllers. Use dedicated Query and Action services.

---

## 2. API Endpoint Specification

| Method | Endpoint | Description | Rate Limit |
| :--- | :--- | :--- | :--- |
| \`POST\` | \`/api/v2/auth/token\` | Issue JWT Token Pair | 5 req / min |
| \`GET\` | \`/api/v2/finance/reports\` | Paginated Ledger Summary | 60 req / min |
| \`POST\` | \`/api/v2/storage/presigned\` | Generate S3 Direct Upload URL | 20 req / min |

---

## 3. High-Performance Execution Loop

\`\`\`mermaid
flowchart LR
    Req[Incoming HTTP Request] --> Auth[Auth & Signature Gate]
    Auth --> Svc[Domain Service Action]
    Svc --> DB[(PostgreSQL Master)]
    Svc --> Event[Dispatch Domain Events]
    Event --> Resp[JSON / Table Response]
\`\`\`

\`\`\`bash
# Run local test suite inside Docker
docker compose exec app php artisan test --parallel
docker compose exec app ./vendor/bin/pint --test
\`\`\`
`,

  scientific: `# Mathematical Foundations & Algorithmic Analysis

> **Topic:** Asymptotic Analysis & Optimization Proofs  
> **Author:** Research & Development Lab  
> **Equation Engine:** KaTeX LaTeX Renderer

---

## 1. Convergence of Gradient Descent

The standard gradient update rule in parameter space $\\mathbb{R}^d$ is formulated as:

$$\\theta_{t+1} = \\theta_t - \\eta \\nabla f(\\theta_t)$$

Where $\\eta > 0$ denotes the learning rate step size. For an $L$-smooth convex objective function $f$:

$$f(y) \\le f(x) + \\nabla f(x)^T (y - x) + \\frac{L}{2} \\|y - x\\|^2$$

Choosing step size $\\eta = \\frac{1}{L}$ guarantees monotone energy descent:

$$f(\\theta_{t+1}) \\le f(\\theta_t) - \\frac{1}{2L} \\|\\nabla f(\\theta_t)\\|^2$$

---

## 2. Complexity Matrix

| Algorithm | Best Case | Average Case | Worst Case | Space Complexity |
| :--- | :---: | :---: | :---: | :---: |
| **QuickSort** | $\\mathcal{O}(n \\log n)$ | $\\mathcal{O}(n \\log n)$ | $\\mathcal{O}(n^2)$ | $\\mathcal{O}(\\log n)$ |
| **MergeSort** | $\\mathcal{O}(n \\log n)$ | $\\mathcal{O}(n \\log n)$ | $\\mathcal{O}(n \\log n)$ | $\\mathcal{O}(n)$ |
| **HeapSort** | $\\mathcal{O}(n \\log n)$ | $\\mathcal{O}(n \\log n)$ | $\\mathcal{O}(n \\log n)$ | $\\mathcal{O}(1)$ |

> [!IMPORTANT]
> Always verify cache locality parameters when benchmarking in-memory sorting on modern NUMA architectures.
`
};
