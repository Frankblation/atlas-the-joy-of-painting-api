const validateQueryParams = (req, res, next) => {
    const { month, subject, color, match, page, pageSize } = req.query;

    // Validate month: should be an integer between 1 and 12
    if (month && (isNaN(month) || month < 1 || month > 12)) {
        return res.status(400).json({ message: 'Invalid month. Should be between 1 and 12.' });
    }

    // Validate subject: should be a non-empty string with letters and spaces only
    if (subject && !/^[a-zA-Z\s]+$/.test(subject)) {
        return res.status(400).json({ message: 'Invalid subject. Should contain only letters and spaces.' });
    }

    // Validate color: should be a non-empty string with letters and spaces only
    if (color && !/^[a-zA-Z\s]+$/.test(color)) {
        return res.status(400).json({ message: 'Invalid color. Should contain only letters and spaces.' });
    }

    // Validate match: should be either 'all' or 'any'
    if (match && !['all', 'any'].includes(match.toLowerCase())) {
        return res.status(400).json({ message: 'Invalid match value. Should be "all" or "any".' });
    }

    // Validate page: should be an integer
    if (page && isNaN(page)) {
        return res.status(400).json({ message: 'Invalid page number. Should be an integer.' });
    }

    // Validate pageSize: should be an integer
    if (pageSize && isNaN(pageSize)) {
        return res.status(400).json({ message: 'Invalid page size. Should be an integer.' });
    }

    // If everything is valid, proceed to the next middleware/controller
    next();
};

export { validateQueryParams };
