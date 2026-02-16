-- Diagnostics table for Sequential Leverage Diagnostic v1
-- Stores raw inputs, derived metrics, and constraint result

CREATE TABLE IF NOT EXISTS public.diagnostics (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamptz DEFAULT now(),
    email text NOT NULL,

    -- Raw inputs
    monthly_revenue numeric NOT NULL,
    cost_of_delivery numeric NOT NULL,
    fixed_expenses numeric NOT NULL,
    leads_per_month numeric NOT NULL,
    deals_closed_per_month numeric NOT NULL,
    average_deal_value numeric NOT NULL,
    max_capacity_per_month numeric NOT NULL,
    current_output_per_month numeric NOT NULL,
    cash_on_hand numeric NOT NULL,
    average_days_to_collect numeric NOT NULL,

    -- Derived metrics
    gross_margin numeric,
    net_profit numeric,
    net_margin numeric,
    conversion_rate numeric,
    capacity_utilization numeric,
    monthly_burn numeric,
    runway_months numeric,

    -- Result
    primary_constraint text NOT NULL
);

-- Enable RLS
ALTER TABLE public.diagnostics ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (diagnostic submissions from the public form)
CREATE POLICY "Allow anonymous inserts" ON public.diagnostics
    FOR INSERT
    TO anon
    WITH CHECK (true);

-- Allow authenticated reads (for admin/dashboard use)
CREATE POLICY "Allow authenticated reads" ON public.diagnostics
    FOR SELECT
    TO authenticated
    USING (true);

-- Grant permissions
GRANT INSERT ON public.diagnostics TO anon;
GRANT SELECT ON public.diagnostics TO authenticated;
