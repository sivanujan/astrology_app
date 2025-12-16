const { db } = require('../config/firebase');

/**
 * AstrologyRule Model for Firestore
 * Collection: astrology_rules
 */
class AstrologyRule {
    constructor(data) {
        this.rule_id = data.rule_id;
        this.category = data.category;
        this.title = data.title;
        this.description = data.description || '';
        this.content = data.content || {};
        this.tags = data.tags || [];
        this.priority = data.priority || 1;
        this.is_active = data.is_active !== undefined ? data.is_active : true;
        this.version = data.version || '1.0';
        this.source = data.source || 'Aditya Guruji';
        this.language = data.language || 'both';
        this.usage_count = data.usage_count || 0;
        this.last_used = data.last_used || null;
        this.createdAt = data.createdAt || new Date();
        this.updatedAt = data.updatedAt || new Date();
    }

    // Validate required fields
    validate() {
        const errors = [];

        if (!this.rule_id) errors.push('Rule ID is required');
        if (!this.category) errors.push('Category is required');
        if (!this.title) errors.push('Title is required');
        if (!this.content || Object.keys(this.content).length === 0) {
            errors.push('Content is required');
        }

        const validCategories = ['Lagna', 'Dasa', 'Transit', 'House', 'Planet', 'Yoga', 'Marriage', 'Career', 'Health', 'General'];
        if (!validCategories.includes(this.category)) {
            errors.push(`Category must be one of: ${validCategories.join(', ')}`);
        }

        return errors;
    }

    // Convert to Firestore document format
    toFirestore() {
        return {
            rule_id: this.rule_id.toLowerCase(),
            category: this.category,
            title: this.title,
            description: this.description,
            content: this.content,
            tags: this.tags,
            priority: this.priority,
            is_active: this.is_active,
            version: this.version,
            source: this.source,
            language: this.language,
            usage_count: this.usage_count,
            last_used: this.last_used,
            updatedAt: new Date()
        };
    }

    // Static: Create new rule
    static async create(ruleData) {
        const rule = new AstrologyRule(ruleData);
        const errors = rule.validate();

        if (errors.length > 0) {
            throw new Error(`Validation failed: ${errors.join(', ')}`);
        }

        const ruleDoc = rule.toFirestore();
        ruleDoc.createdAt = new Date();

        await db.collection('astrology_rules').doc(rule.rule_id.toLowerCase()).set(ruleDoc);
        return rule;
    }

    // Static: Find by rule ID
    static async findByRuleId(ruleId) {
        const doc = await db.collection('astrology_rules').doc(ruleId.toLowerCase()).get();

        if (!doc.exists) {
            return null;
        }

        return new AstrologyRule({ ...doc.data(), rule_id: doc.id });
    }

    // Static: Find by category
    static async findByCategory(category, activeOnly = true) {
        let query = db.collection('astrology_rules').where('category', '==', category);

        if (activeOnly) {
            query = query.where('is_active', '==', true);
        }

        const snapshot = await query.orderBy('priority', 'desc').get();

        if (snapshot.empty) {
            return [];
        }

        return snapshot.docs.map(doc => new AstrologyRule({ ...doc.data(), rule_id: doc.id }));
    }

    // Static: Find by tags
    static async findByTags(tags, activeOnly = true) {
        let query = db.collection('astrology_rules').where('tags', 'array-contains-any', tags);

        if (activeOnly) {
            query = query.where('is_active', '==', true);
        }

        const snapshot = await query.orderBy('priority', 'desc').get();

        if (snapshot.empty) {
            return [];
        }

        return snapshot.docs.map(doc => new AstrologyRule({ ...doc.data(), rule_id: doc.id }));
    }

    // Static: Get all active rules
    static async getAllActive() {
        const snapshot = await db.collection('astrology_rules')
            .where('is_active', '==', true)
            .orderBy('priority', 'desc')
            .get();

        if (snapshot.empty) {
            return [];
        }

        return snapshot.docs.map(doc => new AstrologyRule({ ...doc.data(), rule_id: doc.id }));
    }

    // Static: Update rule
    static async update(ruleId, updateData) {
        const ruleRef = db.collection('astrology_rules').doc(ruleId.toLowerCase());
        const doc = await ruleRef.get();

        if (!doc.exists) {
            throw new Error('Rule not found');
        }

        const updates = {
            ...updateData,
            updatedAt: new Date()
        };

        await ruleRef.update(updates);
        return await AstrologyRule.findByRuleId(ruleId);
    }

    // Static: Delete rule
    static async delete(ruleId) {
        await db.collection('astrology_rules').doc(ruleId.toLowerCase()).delete();
        return true;
    }

    // Instance: Record usage
    async recordUsage() {
        this.usage_count += 1;
        this.last_used = new Date();

        await db.collection('astrology_rules').doc(this.rule_id.toLowerCase()).update({
            usage_count: this.usage_count,
            last_used: this.last_used,
            updatedAt: new Date()
        });
    }

    // Static: Search rules (simple text matching)
    static async search(searchTerm, activeOnly = true) {
        const lowerSearch = searchTerm.toLowerCase();

        // Get all rules
        let query = db.collection('astrology_rules');
        if (activeOnly) {
            query = query.where('is_active', '==', true);
        }

        const snapshot = await query.get();

        if (snapshot.empty) {
            return [];
        }

        // Client-side filtering (Firestore doesn't support full-text search natively)
        const results = snapshot.docs
            .map(doc => new AstrologyRule({ ...doc.data(), rule_id: doc.id }))
            .filter(rule =>
                rule.title.toLowerCase().includes(lowerSearch) ||
                rule.description.toLowerCase().includes(lowerSearch) ||
                rule.tags.some(tag => tag.toLowerCase().includes(lowerSearch))
            );

        return results;
    }
}

module.exports = AstrologyRule;
