const { pool } = require('../db/pool');
const {
    GET_MY_RECENTLY_VIEWED_COMPANIES,
    GET_RECENTLY_PUBLISHED_NEW_LISTINGS_FOR_LUMBER,
    GET_RECENTLY_PUBLISHED_NEW_LISTINGS_FOR_NON_LUMBER,
    GET_INDUSTRY_METRICS_SNAPSHOT_FOR_NON_L,
    GET_INDUSTRY_METRICS_SNAPSHOT_FOR_L,
    GET_ALERT_COMPANIES_WITH_RECENT_KEY_CHANGES,
    GET_BLUE_BOOK_SCORE_DISTRIBUTION_FOR_LUMBER,
    GET_BLUE_BOOK_SCORE_DISTRIBUTION_FOR_NON_LUMBER,
    GET_INDUSTRY_PAY_TREND_TOTAL_EXPERIENCES,
    GET_INDUSTRY_PAY_TREND_TOTAL_EXPERIENCES_ACCOUNTS_RECEIVABLE_NON_LUMBER,
    GET_INDUSTRY_PAY_TREND_TOTAL_EXPERIENCES_ACCOUNTS_RECEIVABLE_LUMBER
} = require('../utlis/utli');

const getDashboardDetails = async function (req, res) {
    const { email, isLumber, industry_type } = req.body;

    try {
        // Querying recently viewed companies
        const recently_viewed_companies = pool.query(GET_MY_RECENTLY_VIEWED_COMPANIES, [email]);

        // Querying recent listings based on lumber status
        const recently_published_new_listings = isLumber
            ? pool.query(GET_RECENTLY_PUBLISHED_NEW_LISTINGS_FOR_LUMBER)
            : pool.query(GET_RECENTLY_PUBLISHED_NEW_LISTINGS_FOR_NON_LUMBER);

        // Querying industry metrics snapshot based on industry type
        const snapshot_for_industry = industry_type === "L"
            ? pool.query(GET_INDUSTRY_METRICS_SNAPSHOT_FOR_L)
            : pool.query(GET_INDUSTRY_METRICS_SNAPSHOT_FOR_NON_L);

        // Querying alert companies with recent key changes
        const alert_companies_with_recent_key_changes = pool.query(GET_ALERT_COMPANIES_WITH_RECENT_KEY_CHANGES);

        // Querying blue book score distribution based on lumber status
        const blue_book_score_distribution = isLumber
            ? pool.query(GET_BLUE_BOOK_SCORE_DISTRIBUTION_FOR_LUMBER)
            : pool.query(GET_BLUE_BOOK_SCORE_DISTRIBUTION_FOR_NON_LUMBER);

        // Querying industry pay trends
        const industry_pay_trends_total_experience = pool.query(GET_INDUSTRY_PAY_TREND_TOTAL_EXPERIENCES);

        // Querying industry pay trends accounts receivable based on lumber status
        const industry_pay_trends_Accounts_Receivable = isLumber
            ? pool.query(GET_INDUSTRY_PAY_TREND_TOTAL_EXPERIENCES_ACCOUNTS_RECEIVABLE_LUMBER)
            : pool.query(GET_INDUSTRY_PAY_TREND_TOTAL_EXPERIENCES_ACCOUNTS_RECEIVABLE_NON_LUMBER);

        // Wait for all queries to complete
        const [
            recently_viewed,
            new_listings,
            industry_snapshot,
            alert_companies,
            blue_book_distribution,
            pay_trends_experience,
            pay_trends_accounts_receivable
        ] = await Promise.all([
            recently_viewed_companies,
            recently_published_new_listings,
            snapshot_for_industry,
            alert_companies_with_recent_key_changes,
            blue_book_score_distribution,
            industry_pay_trends_total_experience,
            industry_pay_trends_Accounts_Receivable
        ]);

        // Send all details in the response
        res.status(200).json({
            recently_viewed_companies: recently_viewed.rows,
            recently_published_new_listings: new_listings.rows,
            industry_metrics_snapshot: industry_snapshot.rows,
            alert_companies_with_recent_key_changes: alert_companies.rows,
            blue_book_score_distribution: blue_book_distribution.rows,
            industry_pay_trends_total_experience: pay_trends_experience.rows,
            industry_pay_trends_accounts_receivable: pay_trends_accounts_receivable.rows
        });
    } catch (error) {
        console.error('Error fetching dashboard details:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = {
    getDashboardDetails
};
