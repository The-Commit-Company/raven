import frappe
from frappe.query_builder.functions import Count


def execute():
	"""

	- Find all duplicate channel members and delete the duplicates except the oldest one
	- Update is_admin on oldest records where any duplicate had admin status
	"""

	raven_channel_member = frappe.qb.DocType("Raven Channel Member")

	query = (
		frappe.qb.from_(raven_channel_member)
		.select(
			raven_channel_member.channel_id,
			raven_channel_member.user_id,
			Count(raven_channel_member.name).as_("count"),
		)
		.groupby(raven_channel_member.channel_id, raven_channel_member.user_id)
		.having(Count(raven_channel_member.name) > 1)
	)

	duplicate_channel_members = query.run(as_dict=True)

	if not duplicate_channel_members:
		return

	# for each duplicate channel member - we preserve the oldest one and delete the rest
	# if any of the duplicate channel members are admins, we preserve the oldest admin and delete the rest

	# Update is_admin on oldest records where any duplicate had admin status
	# This ensures we don't lose admin privileges
	frappe.db.sql(
		"""
        UPDATE `tabRaven Channel Member` rcm
        INNER JOIN (
            SELECT channel_id, user_id, MIN(creation) as min_creation
            FROM `tabRaven Channel Member`
            GROUP BY channel_id, user_id
            HAVING COUNT(*) > 1
        ) oldest ON rcm.channel_id = oldest.channel_id
                AND rcm.user_id = oldest.user_id
                AND rcm.creation = oldest.min_creation
        SET rcm.is_admin = 1
        WHERE EXISTS (
            SELECT 1 FROM `tabRaven Channel Member` dup
            WHERE dup.channel_id = rcm.channel_id
              AND dup.user_id = rcm.user_id
              AND dup.is_admin = 1
        )
        """
	)

	# Delete all duplicates except the oldest one
	frappe.db.sql(
		"""
        DELETE rcm FROM `tabRaven Channel Member` rcm
        INNER JOIN (
            SELECT channel_id, user_id, MIN(creation) as min_creation
            FROM `tabRaven Channel Member`
            GROUP BY channel_id, user_id
            HAVING COUNT(*) > 1
        ) duplicates
        ON rcm.channel_id = duplicates.channel_id
           AND rcm.user_id = duplicates.user_id
           AND rcm.creation > duplicates.min_creation
        """
	)
