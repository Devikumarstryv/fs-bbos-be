const SELECT_USERS = 'SELECT * FROM users';
const SELECT_USER_BYID = 'SELECT * FROM users WHERE id = $1';
// const INSERT_USER = 'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *';
const UPDATE_USER = 'UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING *';
const DELETE_USER = 'DELETE FROM users WHERE id = $1 RETURNING *';
const FETCH_LOGIN_CREDENTIALS = 'SELECT * FROM public.prwebuser WHERE email = $1;';

const CREATE_NEW_USER = ' INSERT INTO public.prwebuser (email, password, first_nm,last_nm) VALUES ($1, $2, $3, $4) RETURNING *';

const GET_MY_RECENTLY_VIEWED_COMPANIES = `SELECT  prwsat_AssociatedID,comp_PRBookTradestyle,   prci_City || ',' ||    
case when prst_CountryId in (1, 2) then prst_Abbreviation when prst_CountryId = 3 then prst_Abbreviation || ',' || prcn_Country  
else prcn_Country end as CityStateCountryShort 
FROM PRWebAuditTrail_BKP
JOIN Company comp  ON prwsat_AssociatedID = comp_CompanyId
JOIN PRCity city  ON comp_PRListingCityID = prci_CityId
INNER JOIN PRState  ON prst_StateId = prci_StateId   
INNER JOIN PRCountry  ON prcn_CountryId = prst_CountryId 
JOIN PhoneLink phones  ON comp_CompanyID = PLink_RecordID 
INNER JOIN Phone phone  ON PLink_PhoneId = phon_PhoneId   AND phone.phon_PRIsPhone='Y' AND phone.phon_PRPreferredPublished='Y'
LEFT OUTER JOIN Custom_Captions ON plink_Type = Capt_Code AND Capt_Family = 'Phon_TypeCompany'
WHERE (prwsat_PageName LIKE '%CompanyDetailsSummary.aspx'  OR prwsat_PageName LIKE '%Company.aspx'  
OR prwsat_PageName LIKE '%CompanyView.aspx' OR prwsat_PageName LIKE '%getcompany') AND prwsat_WebUserID = 86806   
AND prwsat_AssociatedType = 'C' AND comp_PRListingStatus IN ('L', 'H', 'N3', 'N5', 'N6', 'LUV')
AND PLink_EntityId = 5  AND phon_Deleted IS NULL AND PLink_Deleted IS NULL  
GROUP BY  prwsat_AssociatedID  ,comp_PRBookTradestyle,prci_City,prst_CountryId   ,prst_Abbreviation,prcn_Country
ORDER BY MAX(prwsat_CreatedDate) DESC limit 5;`

const GET_RECENTLY_PUBLISHED_NEW_LISTINGS_FOR_LUMBER = `SELECT TOP(5) comp_CompanyID, comp_PRBookTradestyle, prci_City + ', ' + case when prst_CountryId in (1, 2) then prst_Abbreviation
when prst_CountryId = 3 then prst_Abbreviation + ', ' + prcn_Country
else prcn_Country
end as CityStateCountryShort, comp_PRListedDate
FROM Company comp WITH (NOLOCK)
JOIN dbo.PRCity city WITH (NOLOCK) ON comp_PRListingCityID = prci_CityId
INNER JOIN dbo.PRState WITH (NOLOCK) ON prst_StateId = prci_StateId
INNER JOIN dbo.PRCountry WITH (NOLOCK) ON prcn_CountryId = prst_CountryId
JOIN PhoneLink phones WITH (NOLOCK) ON comp_CompanyID = PLink_RecordID
INNER JOIN Phone phone WITH (NOLOCK) ON PLink_PhoneId = phon_PhoneId AND phone.phon_PRIsPhone='Y' AND phone.phon_PRPreferredPublished='Y'
LEFT OUTER JOIN Custom_Captions ON plink_Type = Capt_Code AND Capt_Family = 'Phon_TypeCompany'
WHERE
comp_PRIndustryType = 'L'
AND comp_PRType = 'H'
AND comp_PRLocalSource IS NULL
AND comp_PRListingStatus = 'L'
AND comp_PRListingStatus IN ('L', 'H', 'N3', 'N5', 'N6', 'LUV')
AND PLink_EntityId = 5 AND phon_Deleted IS NULL AND PLink_Deleted IS NULL
ORDER BY comp_PRListedDate DESC;`

const GET_RECENTLY_PUBLISHED_NEW_LISTINGS_FOR_NON_LUMBER = `SELECT TOP(5) comp_CompanyID, comp_PRBookTradestyle, prci_City + ', ' + case when prst_CountryId in (1, 2) then prst_Abbreviation
when prst_CountryId = 3 then prst_Abbreviation + ', ' + prcn_Country
else prcn_Country
end as CityStateCountryShort, comp_PRListedDate
FROM Company comp WITH (NOLOCK)
JOIN dbo.PRCity city WITH (NOLOCK) ON comp_PRListingCityID = prci_CityId
INNER JOIN dbo.PRState WITH (NOLOCK) ON prst_StateId = prci_StateId
INNER JOIN dbo.PRCountry WITH (NOLOCK) ON prcn_CountryId = prst_CountryId
JOIN PhoneLink phones WITH (NOLOCK) ON comp_CompanyID = PLink_RecordID
INNER JOIN Phone phone WITH (NOLOCK) ON PLink_PhoneId = phon_PhoneId AND phone.phon_PRIsPhone='Y' AND phone.phon_PRPreferredPublished='Y'
LEFT OUTER JOIN Custom_Captions ON plink_Type = Capt_Code AND Capt_Family = 'Phon_TypeCompany'
WHERE
comp_PRIndustryType <> 'L'
AND comp_PRType = 'H'
AND comp_PRLocalSource IS NULL
AND comp_PRListingStatus = 'L'
AND comp_PRListingStatus IN ('L', 'H', 'N3', 'N5', 'N6', 'LUV')
AND PLink_EntityId = 5 AND phon_Deleted IS NULL AND PLink_Deleted IS NULL
ORDER BY comp_PRListedDate DESC;`

const GET_INDUSTRY_METRICS_SNAPSHOT_FOR_L = "SELECT prim_Metric [Metric], prim_Count [Count] FROM PRIndustryMetrics WHERE prim_IndustryType = 'Lumber';"
const GET_INDUSTRY_METRICS_SNAPSHOT_FOR_NON_L = "SELECT prim_Metric [Metric], prim_Count [Count] FROM PRIndustryMetrics WHERE prim_IndustryType = 'Produce';"

const GET_ALERT_COMPANIES_WITH_RECENT_KEY_CHANGES = `SELECT TOP(5) comp_CompanyID, comp_PRBookTradestyle, prci_City + ', ' + case when prst_CountryId in (1, 2) then prst_Abbreviation
when prst_CountryId = 3 then prst_Abbreviation + ', ' + prcn_Country
else prcn_Country
end as CityStateCountryShort, prcs_PublishableDate
FROM PRWebUserList WITH (NOLOCK)
INNER JOIN PRWebUserListDetail WITH (NOLOCK) ON prwucl_WebUserListID = prwuld_WebUserListID
JOIN Company comp WITH (NOLOCK) ON prwuld_AssociatedID = comp_CompanyID
JOIN dbo.PRCity city WITH (NOLOCK) ON comp_PRListingCityID = prci_CityId
INNER JOIN dbo.PRState WITH (NOLOCK) ON prst_StateId = prci_StateId
INNER JOIN dbo.PRCountry WITH (NOLOCK) ON prcn_CountryId = prst_CountryId
JOIN PhoneLink phones WITH (NOLOCK) ON comp_CompanyID = PLink_RecordID
INNER JOIN Phone phone WITH (NOLOCK) ON PLink_PhoneId = phon_PhoneId AND phone.phon_PRIsPhone='Y' AND phone.phon_PRPreferredPublished='Y'
INNER JOIN PRCreditSheet WITH (NOLOCK) ON prwuld_AssociatedID = prcs_CompanyID
WHERE prwucl_WebUserID=86806
AND prwucl_TypeCode = 'AUS'
AND prcs_KeyFlag = 'Y'
AND prcs_Status = 'P'
ORDER BY prcs_PublishableDate DESC`

const GET_BLUE_BOOK_SCORE_DISTRIBUTION_FOR_LUMBER = `SELECT Bracket,
       COUNT(1) as BracketCount,
       TotalCount,
       CAST(COUNT(1) as Decimal(10,3)) / CAST(TotalCount as Decimal(10,3)) as Pct
FROM (
    SELECT CASE 
               WHEN prbs_BBScore >= 900 THEN '900-999'
               WHEN prbs_BBScore >= 800 THEN '800-899'
               WHEN prbs_BBScore >= 700 THEN '700-799'
               WHEN prbs_BBScore >= 600 THEN '600-699'
               WHEN prbs_BBScore >= 500 THEN '500-599'
           END as Bracket
    FROM PRBBScore WITH (NOLOCK)
    INNER JOIN Company ON prbs_CompanyID = comp_CompanyID
    WHERE comp_PRIndustryType = 'L'
    AND comp_PRListingStatus = 'L'
    AND prbs_Current = 'Y'
    AND prbs_PRPublish = 'Y'
) T1
CROSS JOIN (
    SELECT COUNT(1) as TotalCount
    FROM PRBBScore WITH (NOLOCK)
    INNER JOIN Company ON prbs_CompanyID = comp_CompanyID
    WHERE comp_PRIndustryType = 'L'
    AND comp_PRListingStatus = 'L'
    AND prbs_Current = 'Y'
    AND prbs_PRPublish = 'Y'
) T2
GROUP BY Bracket, TotalCount
ORDER BY Bracket;
`

const GET_BLUE_BOOK_SCORE_DISTRIBUTION_FOR_NON_LUMBER = `SELECT Bracket,
       COUNT(1) as BracketCount,
       TotalCount,
       CAST(COUNT(1) as Decimal(10,3)) / CAST(TotalCount as Decimal(10,3)) as Pct
FROM (
    SELECT CASE 
               WHEN prbs_BBScore >= 900 THEN '900-999'
               WHEN prbs_BBScore >= 800 THEN '800-899'
               WHEN prbs_BBScore >= 700 THEN '700-799'
               WHEN prbs_BBScore >= 600 THEN '600-699'
               WHEN prbs_BBScore >= 500 THEN '500-599'
           END as Bracket
    FROM PRBBScore WITH (NOLOCK)
    INNER JOIN Company ON prbs_CompanyID = comp_CompanyID
    WHERE comp_PRIndustryType <> 'L'
    AND comp_PRListingStatus = 'L'
    AND prbs_Current = 'Y'
    AND prbs_PRPublish = 'Y'
) T1
CROSS JOIN (
    SELECT COUNT(1) as TotalCount
    FROM PRBBScore WITH (NOLOCK)
    INNER JOIN Company ON prbs_CompanyID = comp_CompanyID
    WHERE comp_PRIndustryType <> 'L'
    AND comp_PRListingStatus = 'L'
    AND prbs_Current = 'Y'
    AND prbs_PRPublish = 'Y'
) T2
GROUP BY Bracket, TotalCount
ORDER BY Bracket;
`

const GET_INDUSTRY_PAY_TREND_TOTAL_EXPERIENCES = `SELECT PayRating,
REPLACE(REPLACE(SUBSTRING(PayRating, 0, LEN(PayRating)-10),' -','-'),'- ','-') AS PayRatingShort,
PayRatingCount,TotalCount,CAST(PayRatingCount as Decimal(10,3)) / CAST(TotalCount as Decimal(10,3)) as Pct
FROM (SELECT prtr_PayRatingId,CAST(capt_us as varchar(100)) PayRating,prpy_Order,
COUNT(1) PayRatingCount
FROM PRTradeReport WITH (NOLOCK)
INNER JOIN Company C1 WITH (NOLOCK) ON prtr_SubjectID = C1.comp_CompanyID
INNER JOIN Company C2 WITH (NOLOCK) ON C2.Comp_CompanyId = prtr_ResponderId AND C2.comp_PRIgnoreTES IS NULL
INNER JOIN PRPayRating ON prtr_PayRatingID = prpy_PayRatingID
INNER JOIN Custom_Captions ON prpy_Name = capt_code AND capt_family = 'prpy_Name'
WHERE C1.comp_PRIndustryType <> 'L'
AND C1.comp_PRListingStatus = 'L'
AND prtr_PayRatingId IS NOT NULL
AND prtr_PayRatingId <> ''
AND prtr_Date >= CAST(DATEADD(month, -12, GETDATE()) as Date)
GROUP BY prtr_PayRatingId, CAST(capt_us as varchar(100)), prpy_Order) T1
CROSS JOIN (SELECT COUNT(1) as TotalCount
FROM PRTradeReport WITH (NOLOCK)
INNER JOIN Company C1 WITH (NOLOCK) ON prtr_SubjectID = C1.comp_CompanyID
INNER JOIN Company C2 WITH (NOLOCK) ON C2.Comp_CompanyId = prtr_ResponderId AND C2.comp_PRIgnoreTES IS NULL
WHERE C1.comp_PRIndustryType <> 'L'
AND C1.comp_PRListingStatus = 'L' -- Listed only?
AND prtr_PayRatingId IS NOT NULL
AND prtr_PayRatingId <> ''
AND prtr_Date >= CAST(DATEADD(month, -12, GETDATE()) as Date)) T2
ORDER BY prpy_Order`

const GET_INDUSTRY_PAY_TREND_TOTAL_EXPERIENCES_ACCOUNTS_RECEIVABLE_LUMBER = `DECLARE @NumMonths int = 12
DECLARE @EndDate date = EOMONTH(GETDATE()) DECLARE @BeginningOfMonth date = DATEADD(mm,datediff(mm,0,@EndDate),0)
DECLARE @StartDate date = DATEADD(mm, -(@NumMonths-1), @BeginningOfMonth)
SELECT YEAR(praa_Date) as [Year],MONTH(praa_Date) as [Month], FORMAT(praa_Date, 'MMM') + '-' + RIGHT(CAST(YEAR(praa_Date) as varchar(4)), 2) DisplayText,
COUNT(1) as ReportCount,COUNT(DISTINCT praa_CompanyID) as SubmitterCount,SUM(ISNULL(praad_AmountCurrent, 0)) AmountCurrent, SUM(ISNULL(praad_Amount1to30, 0)) Amount1to30,SUM(ISNULL(praad_Amount31to60, 0)) Amount31to60, SUM(ISNULL(praad_Amount61to90, 0)) Amount61to90,
SUM(ISNULL(praad_Amount91Plus, 0)) Amount91Plus, SUM(ISNULL(praad_AmountCurrent, 0)) + SUM(ISNULL(praad_Amount1to30, 0)) + SUM(ISNULL(praad_Amount31to60, 0)) + SUM(ISNULL(praad_Amount61to90, 0)) + SUM(ISNULL(praad_Amount91Plus, 0)) as Total,
dbo.ufn_Divide(SUM(ISNULL(praad_AmountCurrent, 0)), (SUM(ISNULL(praad_AmountCurrent, 0)) + SUM(ISNULL(praad_Amount1to30, 0)) + SUM(ISNULL(praad_Amount31to60, 0)) + SUM(ISNULL(praad_Amount61to90, 0)) + SUM(ISNULL(praad_Amount91Plus, 0)))) AmountCurrentPct,
dbo.ufn_Divide(SUM(ISNULL(praad_Amount1to30, 0)), (SUM(ISNULL(praad_AmountCurrent, 0)) + SUM(ISNULL(praad_Amount1to30, 0)) + SUM(ISNULL(praad_Amount31to60, 0)) + SUM(ISNULL(praad_Amount61to90, 0)) + SUM(ISNULL(praad_Amount91Plus, 0)))) Amount1to30Pct,
dbo.ufn_Divide(SUM(ISNULL(praad_Amount31to60, 0)), (SUM(ISNULL(praad_AmountCurrent, 0)) + SUM(ISNULL(praad_Amount1to30, 0)) + SUM(ISNULL(praad_Amount31to60, 0)) + SUM(ISNULL(praad_Amount61to90, 0)) + SUM(ISNULL(praad_Amount91Plus, 0)))) Amount31to60Pct,
dbo.ufn_Divide(SUM(ISNULL(praad_Amount61to90, 0)), (SUM(ISNULL(praad_AmountCurrent, 0)) + SUM(ISNULL(praad_Amount1to30, 0)) + SUM(ISNULL(praad_Amount31to60, 0)) + SUM(ISNULL(praad_Amount61to90, 0)) + SUM(ISNULL(praad_Amount91Plus, 0)))) Amount61to90Pct,
dbo.ufn_Divide(SUM(ISNULL(praad_Amount91Plus, 0)), (SUM(ISNULL(praad_AmountCurrent, 0)) + SUM(ISNULL(praad_Amount1to30, 0)) + SUM(ISNULL(praad_Amount31to60, 0)) + SUM(ISNULL(praad_Amount61to90, 0)) + SUM(ISNULL(praad_Amount91Plus, 0)))) Amount91PlusPct
FROM PRARAging WITH (NOLOCK) INNER JOIN PRARAgingDetail WITH (NOLOCK) ON praa_ARAgingId = praad_ARAgingId
INNER JOIN Company ON praad_SubjectCompanyID = Company.Comp_CompanyId
WHERE praa_Date BETWEEN @StartDate AND @EndDate
AND praad_SubjectCompanyID IS NOT NULL AND comp_PRIndustryType IN ('L') GROUP BY YEAR(praa_Date),MONTH(praa_Date),FORMAT(praa_Date, 'MMM') + '-' + RIGHT(CAST(YEAR(praa_Date) as varchar(4)), 2)
ORDER BY [Year] ASC,[Month] ASC`

const GET_INDUSTRY_PAY_TREND_TOTAL_EXPERIENCES_ACCOUNTS_RECEIVABLE_NON_LUMBER = `DECLARE @NumMonths int = 12
DECLARE @EndDate date = EOMONTH(GETDATE())
DECLARE @BeginningOfMonth date = DATEADD(mm,datediff(mm,0,@EndDate),0)
DECLARE @StartDate date = DATEADD(mm, -(@NumMonths-1), @BeginningOfMonth)
SELECT YEAR(praa_Date) as [Year],
MONTH(praa_Date) as [Month],
FORMAT(praa_Date, 'MMM') + '-' + RIGHT(CAST(YEAR(praa_Date) as varchar(4)), 2) DisplayText,
COUNT(1) as ReportCount,
COUNT(DISTINCT praa_CompanyID) as SubmitterCount,
SUM(ISNULL(praad_Amount0to29, 0)) Amount0to29,
SUM(ISNULL(praad_Amount30to44, 0)) Amount30to44,
SUM(ISNULL(praad_Amount45to60, 0)) Amount45to60,
SUM(ISNULL(praad_Amount61Plus, 0)) Amount61Plus,
SUM(ISNULL(praad_Amount0to29, 0)) + SUM(ISNULL(praad_Amount30to44, 0)) + SUM(ISNULL(praad_Amount45to60, 0)) + SUM(ISNULL(praad_Amount61Plus, 0)) as Total,
dbo.ufn_Divide(SUM(ISNULL(praad_Amount0to29, 0)), (SUM(ISNULL(praad_Amount0to29, 0)) + SUM(ISNULL(praad_Amount30to44, 0)) + SUM(ISNULL(praad_Amount45to60, 0)) + SUM(ISNULL(praad_Amount61Plus, 0)))) Amount0to29Pct,
dbo.ufn_Divide(SUM(ISNULL(praad_Amount30to44, 0)), (SUM(ISNULL(praad_Amount0to29, 0)) + SUM(ISNULL(praad_Amount30to44, 0)) + SUM(ISNULL(praad_Amount45to60, 0)) + SUM(ISNULL(praad_Amount61Plus, 0)))) Amount30to44Pct,
dbo.ufn_Divide(SUM(ISNULL(praad_Amount45to60, 0)), (SUM(ISNULL(praad_Amount0to29, 0)) + SUM(ISNULL(praad_Amount30to44, 0)) + SUM(ISNULL(praad_Amount45to60, 0)) + SUM(ISNULL(praad_Amount61Plus, 0)))) Amount45to60Pct,
dbo.ufn_Divide(SUM(ISNULL(praad_Amount61Plus, 0)), (SUM(ISNULL(praad_Amount0to29, 0)) + SUM(ISNULL(praad_Amount30to44, 0)) + SUM(ISNULL(praad_Amount45to60, 0)) + SUM(ISNULL(praad_Amount61Plus, 0)))) Amount61PlusPct
FROM PRARAging WITH (NOLOCK) INNER JOIN PRARAgingDetail WITH (NOLOCK) ON praa_ARAgingId = praad_ARAgingId
INNER JOIN Company ON praad_SubjectCompanyID = Company.Comp_CompanyId
WHERE praa_Date BETWEEN @StartDate AND @EndDate
AND praad_SubjectCompanyID IS NOT NULL AND comp_PRIndustryType IN ('P','S','T') GROUP BY YEAR(praa_Date), MONTH(praa_Date), FORMAT(praa_Date, 'MMM') + '-' + RIGHT(CAST(YEAR(praa_Date) as varchar(4)), 2) ORDER BY [Year] ASC, [Month] ASC`

module.exports = {
    SELECT_USERS,
    SELECT_USER_BYID,
    // INSERT_USER,
    UPDATE_USER,
    DELETE_USER,
    FETCH_LOGIN_CREDENTIALS,
    CREATE_NEW_USER,
    GET_MY_RECENTLY_VIEWED_COMPANIES,
    GET_RECENTLY_PUBLISHED_NEW_LISTINGS_FOR_LUMBER,
    GET_RECENTLY_PUBLISHED_NEW_LISTINGS_FOR_NON_LUMBER,
    GET_INDUSTRY_METRICS_SNAPSHOT_FOR_NON_L,
    GET_INDUSTRY_METRICS_SNAPSHOT_FOR_L,
    GET_ALERT_COMPANIES_WITH_RECENT_KEY_CHANGES,
    GET_BLUE_BOOK_SCORE_DISTRIBUTION_FOR_LUMBER,
    GET_BLUE_BOOK_SCORE_DISTRIBUTION_FOR_NON_LUMBER,
    GET_INDUSTRY_PAY_TREND_TOTAL_EXPERIENCES,
    GET_INDUSTRY_PAY_TREND_TOTAL_EXPERIENCES_ACCOUNTS_RECEIVABLE_LUMBER,
    GET_INDUSTRY_PAY_TREND_TOTAL_EXPERIENCES_ACCOUNTS_RECEIVABLE_NON_LUMBER
};
